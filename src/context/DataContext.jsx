import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialMandalSettings, initialPavtiList, initialExpenseList, initialEventList } from '../data/initialData';

const DataContext = createContext();

// Client-side image compression utility
export const compressImage = (file, maxWidth = 1000, quality = 0.75) => {
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
          address: 'शिंदे मळा, हिंगणी दुमाला , ४१२२१०',
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
              if (!incomingSettings.address || incomingSettings.address.includes('Dumala') || incomingSettings.address.includes('सातारा') || incomingSettings.address.includes('शिंदे मळा, हिंगणी दुमाला, शिंदे मळा')) {
                incomingSettings.address = 'शिंदे मळा, हिंगणी दुमाला , ४१२२१०';
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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mandal_settings', JSON.stringify(mandalSettings));
  }, [mandalSettings]);

  useEffect(() => {
    localStorage.setItem('mandal_pavti_data', JSON.stringify(pavtiList));
  }, [pavtiList]);

  useEffect(() => {
    localStorage.setItem('mandal_expense_data', JSON.stringify(expenseList));
  }, [expenseList]);

  useEffect(() => {
    localStorage.setItem('mandal_events_data', JSON.stringify(eventList));
  }, [eventList]);

  useEffect(() => {
    localStorage.setItem('mandal_theme', theme);
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

  // Settings & Reset
  const updateSettings = (newSettings) => {
    setMandalSettings((prev) => ({ ...prev, ...newSettings }));

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    }).catch((err) => console.warn('Could not sync settings to MongoDB:', err.message));
  };

  const resetToSampleData = () => {
    setMandalSettings(initialMandalSettings);
    setPavtiList(initialPavtiList);
    setExpenseList(initialExpenseList);
    setEventList(initialEventList);
  };

  const clearAllData = () => {
    setPavtiList([]);
    setExpenseList([]);
    setEventList([]);
    localStorage.removeItem('mandal_pavti_data');
    localStorage.removeItem('mandal_expense_data');
    localStorage.removeItem('mandal_events_data');

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
