import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  initialMandalSettings,
  initialPavtiList,
  initialExpenseList,
  initialEventList,
  initialMahaprasadData,
  initialCompetitionsList
} from '../data/initialData';

const DataContext = createContext();

// Client-side image compression utility - maintains high quality and original aspect ratio
export const compressImage = (file, maxWidth = 1920, quality = 0.90) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // For videos or other media, read as data URL directly
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const sanitizeMandalAddress = (addr) => {
  if (!addr || typeof addr !== 'string') return 'शिंदे मळा, हिंगणी दुमाला, ४१२२१०';
  return addr
    .replace(/,?\s*दौंड,\s*ता\.\s*दौंड,\s*जि\.\s*पुणे\s*-?/g, '')
    .replace(/,?\s*ता\.\s*दौंड,\s*जि\.\s*पुणे\s*-?/g, '')
    .replace(/,?\s*ता\.\s*दौंड/g, '')
    .replace(/,?\s*जि\.\s*पुणे\s*-?/g, '')
    .replace(/,?\s*दौंड/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
};

// Unique client session ID to prevent cross-tab broadcast echo loops
const localClientId = typeof window !== 'undefined'
  ? `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  : 'server';

// Cross-tab Instant Sync (0-millisecond reflection between tabs/pages)
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('shindemala_mandal_sync')
  : null;

const broadcastLocalChange = (type, data) => {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, data, senderId: localClientId, timestamp: Date.now() });
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
};

// Ensures every manakari has a unique, stable id (older data could contain duplicate ids
// which made editing update the wrong / multiple rows). Deterministic so all devices agree.
const normalizeMahaprasad = (data) => {
  if (!data || typeof data !== 'object' || !Array.isArray(data.manakariList)) return data;
  const seen = new Set();
  let changed = false;
  const list = data.manakariList.map((m, i) => {
    const item = m || {};
    let id = item.id;
    if (!id || seen.has(id)) {
      id = `${item.id || 'MK'}-dup${i + 1}`;
      while (seen.has(id)) id = `${id}x`;
      changed = true;
    }
    seen.add(id);
    return id === item.id ? item : { ...item, id };
  });
  return changed ? { ...data, manakariList: list } : data;
};

const generateManakariId = () =>
  `MK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const DataProvider = ({ children }) => {
  // 1. Mandal Settings
  const [mandalSettings, setMandalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          mandalName: 'शिंदे मळा गणेश उत्सव मंडळ',
          address: sanitizeMandalAddress(parsed.address),
          president: 'श्री. तुषार शिंदे',
          treasurer: 'श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे',
          secretary: 'श्री. मानस शिंदे'
        };
      }
      return initialMandalSettings;
    } catch {
      return initialMandalSettings;
    }
  });

  // 2. Pavti List
  const [pavtiList, setPavtiList] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_pavti_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Expense List
  const [expenseList, setExpenseList] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_expense_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Daily Events & Stories List
  const [eventList, setEventList] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_events_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. 24-Hour Stories & Statuses List
  const [statusList, setStatusList] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_status_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Mahaprasad & Manakari Data
  const [mahaprasadData, setMahaprasadData] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_mahaprasad_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return normalizeMahaprasad(parsed);
        }
      }
      return normalizeMahaprasad(initialMahaprasadData);
    } catch {
      return normalizeMahaprasad(initialMahaprasadData);
    }
  });

  // 7. Cultural Competitions & Winners (Home Minister - Khel Paithanicha & Games)
  const [competitionsList, setCompetitionsList] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_competitions_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((comp) => {
            const hasMockWinner = comp.winners?.some((w) => w.name?.includes('पूजा सचिन शिंदे'));
            const hasMockOrg = comp.organizers?.some((o) => o.name?.includes('तुषार शिंदे'));
            if (hasMockWinner || hasMockOrg) {
              return { ...comp, organizers: [], winners: [] };
            }
            return comp;
          });
        }
      }
      return initialCompetitionsList;
    } catch {
      return initialCompetitionsList;
    }
  });

  // Latest mahaprasad data (avoids stale closures on rapid edits) + write tracking
  const mahaprasadRef = useRef(mahaprasadData);
  const pendingMahaprasadWrites = useRef(0);
  const mahaprasadWriteChain = useRef(Promise.resolve());

  useEffect(() => {
    mahaprasadRef.current = mahaprasadData;
  }, [mahaprasadData]);

  // Apply data coming from the server only if it is newer and no local save is in flight
  const applyRemoteMahaprasad = (incoming) => {
    if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.manakariList)) return;
    if (pendingMahaprasadWrites.current > 0) return;
    const cur = mahaprasadRef.current || {};
    const inT = Date.parse(incoming.updatedAt || '') || 0;
    const curT = Date.parse(cur.updatedAt || '') || 0;
    if (inT < curT) return;
    const normalized = normalizeMahaprasad(incoming);
    if (
      inT === curT &&
      Number(normalized.totalExpense) === Number(cur.totalExpense) &&
      normalized.title === cur.title &&
      JSON.stringify(normalized.manakariList) === JSON.stringify(cur.manakariList)
    ) {
      return;
    }
    mahaprasadRef.current = normalized;
    setMahaprasadData(normalized);
  };

  // Real-time client-side ticker every 10 seconds for instant 24-hour expiry check
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
  useEffect(() => {
    const ticker = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 10000);
    return () => clearInterval(ticker);
  }, []);

  // Active unexpired statuses selector (sorted: pinned first, then newest createdAt)
  const activeStatuses = useMemo(() => {
    const now = currentTimestamp;
    return statusList
      .filter((s) => {
        if (s.isActive === false || s.status === 'Expired') return false;
        if (!s.expiresAt) return true;
        return new Date(s.expiresAt).getTime() > now;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [statusList, currentTimestamp]);

  // 5. Active Theme (dark or light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mandal_theme') || 'dark';
  });

  // 6. Online / Offline & MongoDB Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [recentlyAddedPavtiId, setRecentlyAddedPavtiId] = useState(null);

  // Fetch initial data from MongoDB Atlas backend
  useEffect(() => {
    let isMounted = true;
    const fetchAtlasData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.settings && Object.keys(data.settings).length > 0) {
              const incomingSettings = { ...data.settings };
              if (!incomingSettings.address || incomingSettings.address.includes('Dumala') || incomingSettings.address.includes('सातारा') || incomingSettings.address.includes('शिंदे मळा, हिंगणी दुमाला, शिंदे मळा') || incomingSettings.address.includes('दौंड') || incomingSettings.address.includes('पुणे')) {
                incomingSettings.address = 'शिंदे मळा, हिंगणी दुमाला, ४१२२१०';
              } else {
                incomingSettings.address = sanitizeMandalAddress(incomingSettings.address);
              }
              setMandalSettings((prev) => ({ ...prev, ...incomingSettings }));
            }
            if (Array.isArray(data.pavtiList)) {
              setPavtiList(data.pavtiList);
            }
            if (Array.isArray(data.expenseList)) {
              setExpenseList(data.expenseList);
            }
            if (Array.isArray(data.eventList)) {
              setEventList(data.eventList);
            }
            if (Array.isArray(data.statusList)) {
              setStatusList(data.statusList);
            }
            if (data.mahaprasadData && pendingMahaprasadWrites.current === 0) {
              const normalized = normalizeMahaprasad(data.mahaprasadData);
              mahaprasadRef.current = normalized;
              setMahaprasadData(normalized);
            }
            if (Array.isArray(data.competitionsList) && data.competitionsList.length > 0) {
              const cleaned = data.competitionsList.map((comp) => {
                const hasMockWinner = comp.winners?.some((w) => w.name?.includes('पूजा सचिन शिंदे'));
                const hasMockOrg = comp.organizers?.some((o) => o.name?.includes('तुषार शिंदे'));
                if (hasMockWinner || hasMockOrg) {
                  return { ...comp, organizers: [], winners: [] };
                }
                return comp;
              });
              setCompetitionsList(cleaned);
            }
            setIsMongoConnected(true);
            console.log('✅ MongoDB Atlas data successfully synchronized!');
          }
        } else {
          console.warn('Backend API returned non-200 status');
        }
      } catch (err) {
        console.warn('Running with local cached data (MongoDB backend offline or unreachable):', err.message);
        setIsMongoConnected(false);
      }
    };

    fetchAtlasData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-Time Server-Sent Events (SSE) Listener
  // Automatically syncs Statuses, Pavtis, Expenses, and Events in real time without refreshing the page!
  useEffect(() => {
    let eventSource = null;
    let reconnectTimer = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (!parsed || !parsed.type) return;

            switch (parsed.type) {
              case 'STATUS_CREATED':
                setStatusList((prev) => {
                  const filtered = prev.filter((s) => s.id !== parsed.data.id);
                  return [parsed.data, ...filtered];
                });
                break;
              case 'STATUS_UPDATED':
                setStatusList((prev) =>
                  prev.map((s) => (s.id === parsed.data.id ? { ...s, ...parsed.data } : s))
                );
                break;
              case 'STATUS_DELETED':
                setStatusList((prev) => prev.filter((s) => s.id !== parsed.data.id));
                break;
              case 'STATUS_EXPIRED':
                if (Array.isArray(parsed.data?.expiredIds)) {
                  setStatusList((prev) =>
                    prev.map((s) =>
                      parsed.data.expiredIds.includes(s.id)
                        ? { ...s, isActive: false, status: 'Expired' }
                        : s
                    )
                  );
                }
                break;
              case 'STATUS_LIKED':
                setStatusList((prev) =>
                  prev.map((s) => (s.id === parsed.data.id ? { ...s, likes: parsed.data.likes } : s))
                );
                break;
              case 'PAVTI_CREATED':
                setPavtiList((prev) => {
                  const exists = prev.some((p) => p.id === parsed.data.id || p.pavtiNo === parsed.data.pavtiNo);
                  if (exists) return prev.map((p) => (p.id === parsed.data.id ? parsed.data : p));
                  return [parsed.data, ...prev];
                });
                setRecentlyAddedPavtiId(parsed.data.id);
                break;
              case 'PAVTI_UPDATED':
                setPavtiList((prev) =>
                  prev.map((p) => (p.id === parsed.data.id ? { ...p, ...parsed.data } : p))
                );
                break;
              case 'PAVTI_DELETED':
                setPavtiList((prev) => prev.filter((p) => p.id !== parsed.data.id));
                break;
              case 'EXPENSE_CREATED':
                setExpenseList((prev) => {
                  const filtered = prev.filter((e) => e.id !== parsed.data.id);
                  return [parsed.data, ...filtered];
                });
                break;
              case 'EXPENSE_UPDATED':
                setExpenseList((prev) =>
                  prev.map((e) => (e.id === parsed.data.id ? { ...e, ...parsed.data } : e))
                );
                break;
              case 'EXPENSE_DELETED':
                setExpenseList((prev) => prev.filter((e) => e.id !== parsed.data.id));
                break;
              case 'EVENT_CREATED':
                setEventList((prev) => {
                  const filtered = prev.filter((e) => e.id !== parsed.data.id);
                  return [parsed.data, ...filtered];
                });
                break;
              case 'EVENT_UPDATED':
                setEventList((prev) =>
                  prev.map((e) => (e.id === parsed.data.id ? { ...e, ...parsed.data } : e))
                );
                break;
              case 'EVENT_DELETED':
                setEventList((prev) => prev.filter((e) => e.id !== parsed.data.id));
                break;
              case 'MAHAPRASAD_UPDATED':
                if (parsed.data && parsed.data.senderId !== localClientId) {
                  applyRemoteMahaprasad(parsed.data);
                }
                break;
              case 'EVENT_LIKED':
                setEventList((prev) =>
                  prev.map((e) => (e.id === parsed.data.id ? { ...e, likes: parsed.data.likes } : e))
                );
                break;
              case 'COMPETITION_CREATED':
                setCompetitionsList((prev) => [parsed.data, ...prev.filter((c) => c.id !== parsed.data.id)]);
                break;
              case 'COMPETITION_UPDATED':
                setCompetitionsList((prev) =>
                  prev.map((c) => (c.id === parsed.data.id ? { ...c, ...parsed.data } : c))
                );
                break;
              case 'COMPETITION_DELETED':
                setCompetitionsList((prev) => prev.filter((c) => c.id !== parsed.data.id));
                break;
              case 'SETTINGS_UPDATED':
                setMandalSettings((prev) => ({ ...prev, ...parsed.data }));
                break;
              case 'DATA_WIPED':
                setPavtiList([]);
                setExpenseList([]);
                setEventList([]);
                setStatusList([]);
                break;
              default:
                break;
            }
          } catch {
            // Heartbeat / ping
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
          }
          // Exponential backoff reconnect
          reconnectTimer = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        reconnectTimer = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // 1. Cross-tab BroadcastChannel listener (Instant 0ms sync between admin and public pages)
  useEffect(() => {
    if (!syncChannel) return;

    const handleSyncMessage = (event) => {
      const { type, data, senderId } = event.data || {};
      if (!type || senderId === localClientId) return;

      switch (type) {
        case 'MAHAPRASAD_UPDATED':
          if (data && typeof data === 'object') {
            setMahaprasadData(data);
          }
          break;
        case 'PAVTI_UPDATED':
          if (Array.isArray(data)) {
            setPavtiList(data);
          }
          break;
        case 'EXPENSE_UPDATED':
          if (Array.isArray(data)) {
            setExpenseList(data);
          }
          break;
        case 'STATUS_UPDATED':
          if (Array.isArray(data)) {
            setStatusList(data);
          }
          break;
        case 'COMPETITION_UPDATED':
          if (Array.isArray(data)) {
            setCompetitionsList(data);
          }
          break;
        default:
          break;
      }
    };

    syncChannel.onmessage = handleSyncMessage;

    return () => {
      syncChannel.onmessage = null;
    };
  }, []);

  // 2. Storage event listener (syncs across browser tabs when localStorage is updated in another tab)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'mandal_mahaprasad_data' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setMahaprasadData(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 3. Live cloud sync for Mahaprasad: polls every 2s while the tab is visible
  // (SSE push does not work reliably on Vercel serverless, so polling keeps the live site in sync)
  useEffect(() => {
    let inFlight = false;
    const syncLatestMahaprasad = async () => {
      if (inFlight || pendingMahaprasadWrites.current > 0) return;
      inFlight = true;
      try {
        const res = await fetch(`/api/mahaprasad?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const serverData = await res.json();
          applyRemoteMahaprasad(serverData);
        }
      } catch {
        // silent
      } finally {
        inFlight = false;
      }
    };

    const poller = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncLatestMahaprasad();
      }
    }, 2000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncLatestMahaprasad();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(poller);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('परत ऑनलाइन आलात — डेटा सुरक्षित सिंक झाला! (Back Online)', 'success');
      // Re-check MongoDB connection
      fetch('/api/health')
        .then((r) => r.ok && setIsMongoConnected(true))
        .catch(() => setIsMongoConnected(false));
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsMongoConnected(false);
      addToast('तुम्ही सध्या ऑफलाइन आहात — जतन केलेला डेटा वापरला जात आहे (Offline Mode)', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 7. Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe LocalStorage setter with QuotaExceededError protection (avoids React crash on large images)
  const safeSetLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`[Storage] Could not cache ${key} in localStorage (${err.name}):`, err.message);
      if (err.name === 'QuotaExceededError') {
        try {
          // If quota exceeded, strip large base64 media strings for lightweight fallback cache
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const lightweight = parsed.map((item) => {
              if (item && item.media && Array.isArray(item.media)) {
                return {
                  ...item,
                  media: item.media.map((m) => ({
                    ...m,
                    url: typeof m.url === 'string' && m.url.length > 500 ? '/logo.png' : m.url
                  }))
                };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(lightweight));
          }
        } catch {
          // Ignore secondary fallback failure
        }
      }
    }
  };

  // Sync to LocalStorage safely
  useEffect(() => {
    safeSetLocalStorage('mandal_settings', JSON.stringify(mandalSettings));
  }, [mandalSettings]);

  useEffect(() => {
    safeSetLocalStorage('mandal_pavti_data', JSON.stringify(pavtiList));
  }, [pavtiList]);

  useEffect(() => {
    safeSetLocalStorage('mandal_expense_data', JSON.stringify(expenseList));
  }, [expenseList]);

  useEffect(() => {
    safeSetLocalStorage('mandal_events_data', JSON.stringify(eventList));
  }, [eventList]);

  useEffect(() => {
    safeSetLocalStorage('mandal_status_data', JSON.stringify(statusList));
  }, [statusList]);

  useEffect(() => {
    safeSetLocalStorage('mandal_mahaprasad_data', JSON.stringify(mahaprasadData));
  }, [mahaprasadData]);

  useEffect(() => {
    safeSetLocalStorage('mandal_competitions_data', JSON.stringify(competitionsList));
  }, [competitionsList]);

  useEffect(() => {
    safeSetLocalStorage('mandal_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Generate Sequential Pavti Number: e.g. GU-2026-0017
  const getNextPavtiNo = () => {
    const prefix = mandalSettings.pavtiPrefix || `GU-${mandalSettings.year || '2026'}-`;
    let highest = 0;
    pavtiList.forEach((p) => {
      if (p.pavtiNo && p.pavtiNo.startsWith(prefix)) {
        const numPart = parseInt(p.pavtiNo.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highest) {
          highest = numPart;
        }
      }
    });
    const nextNum = highest + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  // Generate Sequential Expense ID: e.g. EXP-2026-0009
  const getNextExpenseId = () => {
    const prefix = `EXP-${mandalSettings.year || '2026'}-`;
    let highest = 0;
    expenseList.forEach((e) => {
      if (e.id && e.id.startsWith(prefix)) {
        const numPart = parseInt(e.id.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highest) {
          highest = numPart;
        }
      }
    });
    const nextNum = highest + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  // Generate Sequential Event ID: e.g. EVT-2026-0009
  const getNextEventId = () => {
    const prefix = `EVT-${mandalSettings.year || '2026'}-`;
    let highest = 0;
    eventList.forEach((ev) => {
      if (ev.id && ev.id.startsWith(prefix)) {
        const numPart = parseInt(ev.id.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highest) {
          highest = numPart;
        }
      }
    });
    const nextNum = highest + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  // Pavti CRUD
  const createPavti = (formData) => {
    const pavtiNo = getNextPavtiNo();
    const newPavti = {
      ...formData,
      id: pavtiNo,
      pavtiNo,
      amount: Number(formData.amount),
      createdAt: new Date().toISOString()
    };
    setPavtiList((prev) => [newPavti, ...prev]);

    // Live celebration highlight for newly created Pavti
    setRecentlyAddedPavtiId(newPavti.id);
    setTimeout(() => {
      setRecentlyAddedPavtiId((cur) => (cur === newPavti.id ? null : cur));
    }, 3500);

    // Sync to MongoDB Atlas
    fetch('/api/pavtis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPavti)
    }).catch((err) => console.warn('Could not sync pavti to MongoDB:', err.message));

    return newPavti;
  };

  const updatePavti = (id, formData) => {
    const updatedPavti = { ...formData, amount: Number(formData.amount) };
    setPavtiList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedPavti } : item))
    );

    fetch(`/api/pavtis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPavti)
    }).catch((err) => console.warn('Could not update pavti in MongoDB:', err.message));
  };

  const deletePavti = (id) => {
    setPavtiList((prev) => prev.filter((item) => item.id !== id));

    fetch(`/api/pavtis/${id}`, {
      method: 'DELETE'
    }).catch((err) => console.warn('Could not delete pavti in MongoDB:', err.message));
  };

  // Expense CRUD
  const createExpense = (formData) => {
    const id = getNextExpenseId();
    const newExpense = {
      ...formData,
      id,
      amount: Number(formData.amount),
      createdAt: new Date().toISOString()
    };
    setExpenseList((prev) => [newExpense, ...prev]);

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    }).catch((err) => console.warn('Could not sync expense to MongoDB:', err.message));

    return newExpense;
  };

  const updateExpense = (id, formData) => {
    const updatedExpense = { ...formData, amount: Number(formData.amount) };
    setExpenseList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedExpense } : item))
    );

    fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    }).catch((err) => console.warn('Could not update expense in MongoDB:', err.message));
  };

  const deleteExpense = (id) => {
    setExpenseList((prev) => prev.filter((item) => item.id !== id));

    fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    }).catch((err) => console.warn('Could not delete expense in MongoDB:', err.message));
  };

  // Event CRUD & Interactions
  const createEvent = (formData) => {
    const id = getNextEventId();
    const newEvent = {
      ...formData,
      id,
      dayNumber: Number(formData.dayNumber) || 1,
      likes: 0,
      isPublished: formData.isPublished !== undefined ? formData.isPublished : true,
      createdAt: new Date().toISOString(),
      timeAgoMr: 'नुकतेच प्रसिद्ध केले',
      timeAgoEn: 'Just now'
    };
    setEventList((prev) => [newEvent, ...prev]);

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    }).catch((err) => console.warn('Could not sync event to MongoDB:', err.message));

    return newEvent;
  };

  const updateEvent = (id, formData) => {
    const updatedEvent = {
      ...formData,
      dayNumber: Number(formData.dayNumber) || formData.dayNumber
    };
    setEventList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedEvent } : item))
    );

    fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    }).catch((err) => console.warn('Could not update event in MongoDB:', err.message));
  };

  const deleteEvent = (id) => {
    setEventList((prev) => prev.filter((item) => item.id !== id));

    fetch(`/api/events/${id}`, {
      method: 'DELETE'
    }).catch((err) => console.warn('Could not delete event in MongoDB:', err.message));
  };

  const togglePinEvent = (id) => {
    let targetStatus = false;
    setEventList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetStatus = !item.isPinned;
          return { ...item, isPinned: targetStatus };
        }
        return item;
      })
    );

    fetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: targetStatus })
    }).catch((err) => console.warn('Could not toggle pin in MongoDB:', err.message));
  };

  const likeEvent = (id) => {
    setEventList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: (item.likes || 0) + 1, isLikedByUser: true } : item))
    );

    fetch(`/api/events/${id}/like`, {
      method: 'POST'
    }).catch((err) => console.warn('Could not register like in MongoDB:', err.message));
  };

  // ================= 24-HOUR STATUS MANAGEMENT =================
  const createStatus = async (statusData) => {
    const now = new Date();
    const createdAt = now.toISOString();
    const pinnedAt = createdAt;
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const uniqueId = `ST-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newStatus = {
      ...statusData,
      _id: uniqueId,
      id: uniqueId,
      createdAt,
      pinnedAt,
      expiresAt,
      isActive: true,
      isPinned: statusData.isPinned ?? false,
      likes: 0,
      viewsCount: 0,
      status: 'Active'
    };

    // Immediate optimistic update
    setStatusList((prev) => [newStatus, ...prev.filter((s) => s.id !== uniqueId)]);

    try {
      const res = await fetch('/api/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          setStatusList((prev) => [data.item, ...prev.filter((s) => s.id !== data.item.id && s.id !== uniqueId)]);
        }
      }
      addToast('स्टेटस यशस्वीरित्या प्रसिद्ध झाला! २४ तास सक्रिय राहील.', 'success');
    } catch (err) {
      console.warn('Could not save status to MongoDB:', err.message);
    }
  };

  const updateStatus = async (id, updateData) => {
    setStatusList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updateData } : s))
    );

    try {
      await fetch(`/api/statuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    } catch (err) {
      console.warn('Could not update status in MongoDB:', err.message);
    }
  };

  const deleteStatus = async (id) => {
    setStatusList((prev) => prev.filter((s) => s.id !== id));

    try {
      await fetch(`/api/statuses/${id}`, {
        method: 'DELETE'
      });
      addToast('स्टेटस हटवण्यात आला आहे.', 'info');
    } catch (err) {
      console.warn('Could not delete status from MongoDB:', err.message);
    }
  };

  const togglePinStatus = async (id) => {
    let targetPin = false;
    setStatusList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          targetPin = !s.isPinned;
          return { ...s, isPinned: targetPin };
        }
        return s;
      })
    );

    try {
      await fetch(`/api/statuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: targetPin })
      });
    } catch (err) {
      console.warn('Could not toggle pin in MongoDB:', err.message);
    }
  };

  const reActivateStatus = async (id) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    setStatusList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isActive: true, status: 'Active', createdAt: now.toISOString(), pinnedAt: now.toISOString(), expiresAt }
          : s
      )
    );

    try {
      await fetch(`/api/statuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reActivate: true })
      });
      addToast('स्टेटस पुन्हा २४ तासांसाठी सक्रिय करण्यात आला आहे!', 'success');
    } catch (err) {
      console.warn('Could not re-activate status:', err.message);
    }
  };

  const likeStatus = async (id) => {
    setStatusList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, likes: (s.likes || 0) + 1, isLikedByUser: true } : s))
    );

    try {
      await fetch(`/api/statuses/${id}/like`, { method: 'POST' });
    } catch (err) {
      console.warn('Could not like status:', err.message);
    }
  };

  // ================= CULTURAL COMPETITIONS & HOME MINISTER CRUD =================
  const createCompetition = async (compData) => {
    const id = compData.id || `COMP-${Date.now()}`;
    const newComp = {
      ...compData,
      id,
      updatedAt: new Date().toISOString()
    };
    const nextList = [newComp, ...competitionsList.filter((c) => c.id !== id)];
    setCompetitionsList(nextList);
    broadcastLocalChange('COMPETITION_UPDATED', nextList);

    try {
      await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComp)
      });
      addToast('स्पर्धा / कार्यक्रम यशस्वीरित्या तयार झाला!', 'success');
    } catch (err) {
      console.warn('Could not save competition to MongoDB:', err.message);
    }
  };

  const updateCompetition = async (id, updateData) => {
    const updated = { ...updateData, id, updatedAt: new Date().toISOString() };
    const nextList = (competitionsList || []).map((c) => (c.id === id ? { ...c, ...updated } : c));
    setCompetitionsList(nextList);
    broadcastLocalChange('COMPETITION_UPDATED', nextList);

    try {
      await fetch(`/api/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      addToast('कार्यक्रमाची माहिती व विजेत्यांची यादी सेव्ह झाली!', 'success');
    } catch (err) {
      console.warn('Could not update competition in MongoDB:', err.message);
    }
  };

  const deleteCompetition = async (id) => {
    const nextList = (competitionsList || []).filter((c) => c.id !== id);
    setCompetitionsList(nextList);
    broadcastLocalChange('COMPETITION_UPDATED', nextList);

    try {
      await fetch(`/api/competitions/${id}`, { method: 'DELETE' });
      addToast('कार्यक्रम हटवण्यात आला.', 'info');
    } catch (err) {
      console.warn('Could not delete competition from MongoDB:', err.message);
    }
  };

  // Mahaprasad Management Functions (Synchronous 0ms UI reflection + ordered Cloud Sync)
  const getCurrentMahaprasad = () => mahaprasadRef.current || mahaprasadData || initialMahaprasadData;

  const commitMahaprasad = (nextData) => {
    const next = { ...nextData, senderId: localClientId };

    // 1. Instant Synchronous Update (0ms) in State & LocalStorage
    mahaprasadRef.current = next;
    setMahaprasadData(next);
    safeSetLocalStorage('mandal_mahaprasad_data', JSON.stringify(next));

    // 2. Instant Cross-Tab Broadcast (0ms)
    broadcastLocalChange('MAHAPRASAD_UPDATED', next);

    // 3. Cloud Sync to MongoDB (queued so saves always reach the server in order)
    pendingMahaprasadWrites.current += 1;
    mahaprasadWriteChain.current = mahaprasadWriteChain.current
      .then(() =>
        fetch('/api/mahaprasad', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next)
        })
      )
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json().catch(() => ({}));
        if (body && body.updatedAt) {
          const merged = { ...mahaprasadRef.current, updatedAt: body.updatedAt };
          mahaprasadRef.current = merged;
          setMahaprasadData(merged);
        }
      })
      .catch((err) => {
        console.warn('Could not sync mahaprasad to MongoDB:', err.message);
        addToast('क्लाउडवर सेव्ह होऊ शकले नाही — कृपया इंटरनेट तपासून पुन्हा प्रयत्न करा', 'error');
      })
      .finally(() => {
        pendingMahaprasadWrites.current = Math.max(0, pendingMahaprasadWrites.current - 1);
      });
  };

  const updateMahaprasadSettings = (updatedFields) => {
    const currentData = getCurrentMahaprasad();
    commitMahaprasad({ ...currentData, ...updatedFields });
    addToast('महाप्रसाद माहिती यशस्वीरित्या सेव्ह झाली!', 'success');
  };

  const addManakari = (newManakari) => {
    const currentData = getCurrentMahaprasad();
    const currentList = currentData.manakariList || [];
    const newCount = currentList.length + 1;
    const expectedShare = Number(currentData.totalExpense || 0) > 0 ? Math.round(Number(currentData.totalExpense) / newCount) : 0;
    const id = generateManakariId();
    const item = {
      id,
      name: (newManakari.name || '').trim(),
      phone: (newManakari.phone || '').trim(),
      address: (newManakari.address || '').trim(),
      status: newManakari.status || 'Paid',
      paidAmount: Number(newManakari.paidAmount ?? (newManakari.status === 'Pending' ? 0 : expectedShare)),
      paidDate: newManakari.paidDate || new Date().toISOString().split('T')[0],
      paymentMode: newManakari.paymentMode || 'Cash',
      remarks: newManakari.remarks || 'मानकरी वाटा'
    };
    // Append in sequential chronological order (1, 2, 3...)
    const updatedList = [...currentList, item];
    commitMahaprasad({ ...currentData, manakariList: updatedList });

    addToast(`नवीन मानकरी क्र. ${newCount} (${item.name}) यशस्वीरित्या जोडले गेले!`, 'success');
  };

  const updateManakari = (id, updatedFields) => {
    const currentData = getCurrentMahaprasad();
    const currentList = currentData.manakariList || [];
    if (!currentList.some((m) => m.id === id)) {
      addToast('हा मानकरी सापडला नाही — कृपया पेज रिफ्रेश करून पुन्हा प्रयत्न करा', 'error');
      return;
    }
    const updatedList = currentList.map((m) =>
      m.id === id ? { ...m, ...updatedFields, id } : m
    );
    commitMahaprasad({ ...currentData, manakariList: updatedList });

    addToast('मानकरी माहिती त्वरित अपडेट झाली!', 'success');
  };

  // Drag & drop reorder: moves the whole entry; serial numbers (1, 2, 3...) stay in place
  const reorderManakari = (fromId, toId) => {
    const currentData = getCurrentMahaprasad();
    const list = [...(currentData.manakariList || [])];
    const from = list.findIndex((m) => m.id === fromId);
    const to = list.findIndex((m) => m.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    commitMahaprasad({ ...currentData, manakariList: list });

    addToast(`${moved.name || 'मानकरी'} क्र. ${to + 1} वर हलवले`, 'success');
  };

  const deleteManakari = (id) => {
    const currentData = getCurrentMahaprasad();
    const updatedList = (currentData.manakariList || []).filter((m) => m.id !== id);
    commitMahaprasad({ ...currentData, manakariList: updatedList });

    addToast('मानकरी यादीतून काढण्यात आले!', 'info');
  };

  const toggleManakariPaidStatus = (id) => {
    const currentData = getCurrentMahaprasad();
    const currentList = currentData.manakariList || [];
    const perShare = currentList.length > 0 ? Math.round(Number(currentData.totalExpense || 0) / currentList.length) : 0;
    let targetName = '';
    let isNowPaid = false;

    const updatedList = currentList.map((m) => {
      if (m.id === id) {
        const newStatus = m.status === 'Paid' ? 'Pending' : 'Paid';
        isNowPaid = newStatus === 'Paid';
        targetName = m.name || 'मानकरी';
        return {
          ...m,
          status: newStatus,
          paidAmount: newStatus === 'Paid' ? (m.paidAmount && m.paidAmount > 0 ? m.paidAmount : perShare) : 0,
          paidDate: newStatus === 'Paid' ? (m.paidDate || new Date().toISOString().split('T')[0]) : ''
        };
      }
      return m;
    });
    commitMahaprasad({ ...currentData, manakariList: updatedList });

    if (isNowPaid) {
      addToast(`${targetName}: रक्कम पूर्ण जमा झाली!`, 'success');
    } else {
      addToast(`${targetName}: रक्कम बाकी / शिल्लक केली.`, 'info');
    }
  };

  // Settings & Reset
  const updateSettings = (newSettings) => {
    const cleaned = { ...newSettings };
    if (cleaned.address) {
      cleaned.address = sanitizeMandalAddress(cleaned.address);
    }
    setMandalSettings((prev) => ({ ...prev, ...cleaned }));

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned)
    }).catch((err) => console.warn('Could not sync settings to MongoDB:', err.message));
  };

  const resetToSampleData = () => {
    setMandalSettings(initialMandalSettings);
    setPavtiList(initialPavtiList);
    setExpenseList(initialExpenseList);
    setEventList(initialEventList);
    setMahaprasadData(initialMahaprasadData);
  };

  const clearAllData = () => {
    setPavtiList([]);
    setExpenseList([]);
    setEventList([]);
    setStatusList([]);
    setMahaprasadData({ ...initialMahaprasadData, manakariList: [], totalExpense: 0 });
    localStorage.removeItem('mandal_pavti_data');
    localStorage.removeItem('mandal_expense_data');
    localStorage.removeItem('mandal_events_data');
    localStorage.removeItem('mandal_status_data');
    localStorage.removeItem('mandal_mahaprasad_data');

    fetch('/api/wipe-all', {
      method: 'POST'
    })
      .then((r) => r.json())
      .then(() => {
        addToast('डेटाबेस पूर्णपणे रिकामा करण्यात आला आहे (All Data Wiped)', 'success');
      })
      .catch((err) => {
        console.warn('Wipe failed:', err.message);
      });
  };

  // Totals & Analytics calculations
  const totalCollection = pavtiList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpense = expenseList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const balance = totalCollection - totalExpense;
  const pavtiCount = pavtiList.length;

  // Mahaprasad Analytics Calculations
  const mahaprasadTotalExpense = Number(mahaprasadData?.totalExpense) || 0;
  const manakariList = useMemo(() => mahaprasadData?.manakariList || [], [mahaprasadData]);
  const manakariCount = manakariList.length;
  // प्रत्येकी आलेला खर्च / प्रत्येकाचा वाटा
  const perHeadShare = manakariCount > 0 ? Math.round(mahaprasadTotalExpense / manakariCount) : 0;
  const totalMahaprasadCollected = manakariList.reduce((acc, curr) => acc + (Number(curr.paidAmount) || 0), 0);
  const totalMahaprasadPending = Math.max(0, mahaprasadTotalExpense - totalMahaprasadCollected);
  const paidManakariCount = manakariList.filter((m) => m.status === 'Paid').length;
  const pendingManakariCount = manakariList.filter((m) => m.status !== 'Paid').length;

  return (
    <DataContext.Provider
      value={{
        mandalSettings,
        updateSettings,
        pavtiList,
        recentlyAddedPavtiId,
        createPavti,
        updatePavti,
        deletePavti,
        getNextPavtiNo,
        expenseList,
        createExpense,
        updateExpense,
        deleteExpense,
        getNextExpenseId,
        eventList,
        createEvent,
        updateEvent,
        deleteEvent,
        togglePinEvent,
        likeEvent,
        getNextEventId,
        statusList,
        activeStatuses,
        createStatus,
        updateStatus,
        deleteStatus,
        togglePinStatus,
        reActivateStatus,
        likeStatus,
        mahaprasadData,
        mahaprasadTotalExpense,
        manakariList,
        manakariCount,
        perHeadShare,
        totalMahaprasadCollected,
        totalMahaprasadPending,
        paidManakariCount,
        pendingManakariCount,
        updateMahaprasadSettings,
        addManakari,
        updateManakari,
        reorderManakari,
        deleteManakari,
        toggleManakariPaidStatus,
        competitionsList,
        createCompetition,
        updateCompetition,
        deleteCompetition,
        resetToSampleData,
        clearAllData,
        totalCollection,
        totalExpense,
        balance,
        pavtiCount,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        isOnline,
        isMongoConnected,
        compressImage
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
