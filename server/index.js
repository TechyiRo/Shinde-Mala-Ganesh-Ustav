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

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  try {
    const db = getDB();
    res.json({
      status: 'ok',
      database: db.databaseName,
      connected: true,
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
    const [settingsDoc, pavtiList, expenseList, eventList] = await Promise.all([
      db.collection('settings').findOne({ _id: 'mandal_settings' }),
      db.collection('pavtis').find({}).sort({ pavtiNo: -1 }).toArray(),
      db.collection('expenses').find({}).sort({ date: -1 }).toArray(),
      db.collection('events').find({}).sort({ isPinned: -1, dayNumber: -1, date: -1 }).toArray()
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
      eventList: sanitize(eventList)
    });
  } catch (err) {
    console.error('Error in /api/data:', err);
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
    const doc = { ...pavti, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('pavtis').replaceOne({ _id: id }, doc, { upsert: true });
    res.status(201).json({ success: true, item: { ...doc, id } });
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
    const doc = { ...updateData, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('pavtis').replaceOne({ _id: id }, doc, { upsert: true });
    res.json({ success: true, item: { ...doc, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pavtis/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    await db.collection('pavtis').deleteOne({ _id: id });
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
    const doc = { ...exp, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('expenses').replaceOne({ _id: id }, doc, { upsert: true });
    res.status(201).json({ success: true, item: { ...doc, id } });
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
    const doc = { ...updateData, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('expenses').replaceOne({ _id: id }, doc, { upsert: true });
    res.json({ success: true, item: { ...doc, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    await db.collection('expenses').deleteOne({ _id: id });
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
    const doc = { ...event, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('events').replaceOne({ _id: id }, doc, { upsert: true });
    res.status(201).json({ success: true, item: { ...doc, id } });
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
    const doc = { ...updateData, _id: id, updatedAt: new Date().toISOString() };
    await db.collection('events').replaceOne({ _id: id }, doc, { upsert: true });
    res.json({ success: true, item: { ...doc, id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const db = getDB();
    const id = String(req.params.id);
    await db.collection('events').deleteOne({ _id: id });
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
    res.json({ success: true, likes: result?.likes ?? 0 });
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
    res.json({ success: true, settings: newSettings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wipe all transaction and event data for production deployment
app.post('/api/wipe-all', async (req, res) => {
  try {
    await wipeAllData();
    res.json({ success: true, message: 'All transactions, expenses, and events wiped clean.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static production frontend files from dist/
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React Router / SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server after connecting to MongoDB Atlas
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

startServer();
