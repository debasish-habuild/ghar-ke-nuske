import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedContextType {
  saved:      Set<string>;
  toggleSave: (id: string) => void;
  isSaved:    (id: string) => boolean;
}

const SavedContext = createContext<SavedContextType>({
  saved:      new Set(),
  toggleSave: () => {},
  isSaved:    () => false,
});

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem('saved_remedies').then(val => {
      if (val) setSaved(new Set(JSON.parse(val)));
    });
  }, []);

  const toggleSave = (id: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      AsyncStorage.setItem('saved_remedies', JSON.stringify([...next]));
      return next;
    });
  };

  const isSaved = (id: string) => saved.has(id);

  return (
    <SavedContext.Provider value={{ saved, toggleSave, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => useContext(SavedContext);
