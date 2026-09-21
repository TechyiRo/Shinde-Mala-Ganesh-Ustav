import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDB, wipeAllData } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing (50mb limit for event images/compressed media)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure MongoDB Atlas connection is active for API requests (supports Vercel Serverless & Node.js)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (err) {
      console.warn('MongoDB Atlas connection check:', err.message);
    }
  }
  next();
});

// ================= REAL-TIME SERVER-SENT EVENTS (SSE) =================
const sseClients = new Set();

export function broadcastEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE Stream Endpoint for Live Dashboard Sync
app.get('/api/realtime/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Real-time SSE stream connected' })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Periodic heartbeat keep-alive every 20 seconds
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// ================= AUTOMATIC 24-HOUR STATUS EXPIRY WORKER =================
// Checks database every 30 seconds. If any status is older than 24 hours,
// it marks it isActive: false, status: 'Expired', and broadcasts real-time event.
setInterval(async () => {
  try {
    const db = getDB();
    if (!db) return;
    const nowIso = new Date().toISOString();

    const expiredDocs = await db.collection('statuses').find({
      isActive: true,
      expiresAt: { $lte: nowIso }
    }).toArray();

    if (expiredDocs.length > 0) {
      const expiredIds = expiredDocs.map(s => String(s._id));
      await db.collection('statuses').updateMany(
        { _id: { $in: expiredIds } },
        { $set: { isActive: false, status: 'Expired', updatedAt: nowIso } }
      );
      console.log(`[Auto-Expiry] ${expiredIds.length} status(es) automatically expired at ${nowIso}`);
      broadcastEvent('STATUS_EXPIRED', { expiredIds });
    }
  } catch {
    // Database might not be connected yet during startup
  }
}, 30000);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  try {
    const db = getDB();
    res.json({
      status: 'ok',
      database: db.databaseName,
      connected: true,
      activeSseClients: sseClients.size,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      connected: false,
      message: err.message
    });
  }
});

// Fast Combined Data Endpoint
app.get('/api/data', async (req, res) => {
  try {
    const db = getDB();
    const nowIso = new Date().toISOString();

    const [settingsDoc, pavtiList, expenseList, eventList, statusList] = await Promise.all([
      db.collection('settings').findOne({ _id: 'mandal_settings' }),
      db.collection('pavtis').find({}).sort({ pavtiNo: -1 }).toArray(),
      db.collection('expenses').find({}).sort({ date: -1 }).toArray(),
      db.collection('events').find({}).sort({ isPinned: -1, dayNumber: -1, date: -1 }).toArray(),
      db.collection('statuses').find({}).sort({ isPinned: -1, createdAt: -1 }).toArray()
    ]);

    // Format docs to ensure clean string ids
    const sanitize = (list) =>
      list.map((item) => {
        const { _id, ...rest } = item;
        return { id: String(_id), ...rest };
      });

    let settings = settingsDoc;
    if (settings && settings._id) {
      delete settings._id;
    }

    res.json({
      settings: settings || null,
      pavtiList: sanitize(pavtiList),
      expenseList: sanitize(expenseList),
      eventList: sanitize(eventList),
      statusList: sanitize(statusList)
    });
  } catch (err) {
    console.error('Error in /api/data:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================= 24-HOUR STATUSES CRUD =================
// Get only active, unexpired statuses (for Public Dashboard)
app.get('/api/statuses', async (req, res) => {
  try {
    const db = getDB();
    const nowIso = new Date().toISOString();
    const list = await db.collection('statuses')
      .find({
        isActive: { $ne: false },
        expiresAt: { $gt: nowIso }
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .toArray();

    res.json(list.map(i => ({ ...i, id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all statuses including expired history (for Admin Management)
app.get('/api/statuses/all', async (req, res) => {
  try {
    const db = getDB();
    const list = await db.collection('statuses')
      .find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .toArray();

    res.json(list.map(i => ({ ...i, id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new 24-Hour Status (Admins can create multiple in a single day)
app.post('/api/statuses', async (req, res) => {
  try {
    const db = getDB();
    const statusData = req.body;
    const now = new Date();
    const createdAt = statusData.createdAt || now.toISOString();
    const pinnedAt = createdAt;
    // Exactly 24 hours from creation/pinned timestamp
    const expiresAt = statusData.expiresAt || new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();

    const uniqueId = String(
      statusData.id || `ST-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    );

    const doc = {
      ...statusData,
      _id: uniqueId,
      id: uniqueId,
      createdAt,
      pinnedAt,
      expiresAt,
      isActive: true,
      isPinned: statusData.isPinned ?? false,
      likes: statusData.likes || 0,
      viewsCount: statusData.viewsCount || 0,
      status: 'Active',
      updatedAt: now.toISOString()
    };

    await db.collection('statuses').replaceOne({ _id: uniqueId }, doc, { upsert: true });

    broadcastEvent('STATUS_CREATED', doc);
    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing Status (or re-activate / pin)
app.put('/api/statuses/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const updateData = req.body;
    delete updateData._id;

    // If re-activating an expired status for another 24 hours:
    if (updateData.reActivate) {
      const now = new Date();
      updateData.createdAt = now.toISOString();
      updateData.pinnedAt = now.toISOString();
      updateData.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      updateData.isActive = true;
      updateData.status = 'Active';
      delete updateData.reActivate;
    }

    const doc = {
      ...updateData,
      _id: id,
      id,
      updatedAt: new Date().toISOString()
    };

    await db.collection('statuses').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('STATUS_UPDATED', doc);
    res.json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Status manually
app.delete('/api/statuses/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    await db.collection('statuses').deleteOne({ _id: id });

    broadcastEvent('STATUS_DELETED', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a Status
app.post('/api/statuses/:id/like', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const result = await db.collection('statuses').findOneAndUpdate(
      { _id: id },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );
    const likes = result?.likes ?? 0;
    broadcastEvent('STATUS_LIKED', { id, likes });
    res.json({ success: true, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= PAVTIS CRUD =================
app.get('/api/pavtis', async (req, res) => {
  try {
    const db = getDB();
    const list = await db.collection('pavtis').find({}).sort({ pavtiNo: -1 }).toArray();
    res.json(list.map(i => ({ ...i, id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pavtis', async (req, res) => {
  try {
    const db = getDB();
    const pavti = req.body;
    const id = pavti.id || pavti.pavtiNo;
    const doc = { ...pavti, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('pavtis').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('PAVTI_CREATED', doc);
    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pavtis/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const updateData = req.body;
    delete updateData._id;
    const doc = { ...updateData, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('pavtis').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('PAVTI_UPDATED', doc);
    res.json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pavtis/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    await db.collection('pavtis').deleteOne({ _id: id });

    broadcastEvent('PAVTI_DELETED', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= EXPENSES CRUD =================
app.get('/api/expenses', async (req, res) => {
  try {
    const db = getDB();
    const list = await db.collection('expenses').find({}).sort({ date: -1 }).toArray();
    res.json(list.map(i => ({ ...i, id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const db = getDB();
    const exp = req.body;
    const id = exp.id || 'EXP-' + Date.now();
    const doc = { ...exp, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('expenses').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('EXPENSE_CREATED', doc);
    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const updateData = req.body;
    delete updateData._id;
    const doc = { ...updateData, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('expenses').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('EXPENSE_UPDATED', doc);
    res.json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    await db.collection('expenses').deleteOne({ _id: id });

    broadcastEvent('EXPENSE_DELETED', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= EVENTS CRUD =================
app.get('/api/events', async (req, res) => {
  try {
    const db = getDB();
    const list = await db.collection('events').find({}).sort({ isPinned: -1, dayNumber: -1, date: -1 }).toArray();
    res.json(list.map(i => ({ ...i, id: String(i._id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const db = getDB();
    const event = req.body;
    const id = String(event.id || 'EVT-' + Date.now());
    const doc = { ...event, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('events').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('EVENT_CREATED', doc);
    res.status(201).json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const updateData = req.body;
    delete updateData._id;
    const doc = { ...updateData, _id: id, id, updatedAt: new Date().toISOString() };
    await db.collection('events').replaceOne({ _id: id }, doc, { upsert: true });

    broadcastEvent('EVENT_UPDATED', doc);
    res.json({ success: true, item: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    await db.collection('events').deleteOne({ _id: id });

    broadcastEvent('EVENT_DELETED', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like an Event (increment likes in MongoDB)
app.post('/api/events/:id/like', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    const result = await db.collection('events').findOneAndUpdate(
      { _id: id },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );
    const likes = result?.likes ?? 0;
    broadcastEvent('EVENT_LIKED', { id, likes });
    res.json({ success: true, likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SETTINGS =================
app.get('/api/settings', async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection('settings').findOne({ _id: 'mandal_settings' });
    if (doc && doc._id) delete doc._id;
    res.json(doc || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const db = getDB();
    const newSettings = req.body;
    delete newSettings._id;
    await db.collection('settings').replaceOne(
      { _id: 'mandal_settings' },
      { _id: 'mandal_settings', ...newSettings, updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    broadcastEvent('SETTINGS_UPDATED', newSettings);
    res.json({ success: true, settings: newSettings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wipe all transaction and event data for production deployment
app.post('/api/wipe-all', async (req, res) => {
  try {
    await wipeAllData();
    broadcastEvent('DATA_WIPED', {});
    res.json({ success: true, message: 'All transactions, expenses, events, and statuses wiped clean.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static production frontend files from dist/
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React Router / SPA (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Server after connecting to MongoDB Atlas (for local dev & Node.js hosts like Render/Railway)
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Shinde Mala Ganesh Utsav API server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// In local / standalone Node.js, run HTTP listener; on Vercel Serverless, export app
if (!process.env.VERCEL) {
  startServer();
}

export default app;
