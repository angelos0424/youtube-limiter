import { useState, useEffect, useCallback } from 'react';

// Fix: Add type declaration for the chrome object to satisfy TypeScript
declare const chrome: any;

// This is a mock of chrome.storage.sync for development in a browser environment.
// In a real Chrome extension, you would replace localStorage with chrome.storage.sync.
const chromeStorageMock = {
  sync: {
    get: (key: string | string[], callback: (items: { [key: string]: any }) => void) => {
      try {
        const keys = Array.isArray(key) ? key : [key];
        const result: { [key: string]: any } = {};
        keys.forEach(k => {
          const item = localStorage.getItem(k);
          if (item) {
             const parsedItem = JSON.parse(item);
             result[k] = parsedItem[k];
          }
        });
        callback(result);
      } catch (error) {
        console.error("Error getting item from localStorage", error);
        callback({});
      }
    },
    set: (items: { [key: string]: any }, callback?: () => void) => {
      try {
        for (const key in items) {
          if (Object.prototype.hasOwnProperty.call(items, key)) {
            localStorage.setItem(key, JSON.stringify({[key]: items[key]}));
          }
        }
        if (callback) callback();
      } catch (error) {
        console.error("Error setting item in localStorage", error);
      }
    },
  },
};


export function useChromeStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const storage = (typeof chrome !== 'undefined' && chrome.storage) ? chrome.storage : chromeStorageMock;

  useEffect(() => {
      storage.sync.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        } else {
          setStoredValue(initialValue);
          storage.sync.set({ [key]: initialValue });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    storage.sync.set({ [key]: valueToStore });
  }, [key, storedValue, storage.sync]);

  return [storedValue, setValue];
}
