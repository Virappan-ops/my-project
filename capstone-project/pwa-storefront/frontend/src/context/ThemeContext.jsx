import React, { createContext, useState, useMemo, useEffect } from 'react';

// 1. Context ko create karein
export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

// 2. Provider component banayein
export function CustomThemeProvider({ children }) {
  // 3. State banayein jo localStorage se default value lega
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('theme-mode');
    return storedMode || 'light'; // Default 'light' hai
  });

  // 4. Jab bhi mode change ho, localStorage mein save karein
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // 5. Theme badalne wala function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // 6. Context ki value ko memoize karein taaki bewajah re-render na ho
  const themeValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode]);

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}