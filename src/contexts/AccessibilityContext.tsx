import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (value: 'small' | 'medium' | 'large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Initialize from localStorage and system preferences
  useEffect(() => {
    const savedReduceMotion = localStorage.getItem('accessibility-reduce-motion');
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast');
    const savedFontSize = localStorage.getItem('accessibility-font-size');

    if (savedReduceMotion !== null) {
      setReduceMotion(savedReduceMotion === 'true');
    } else {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotion(mediaQuery.matches);
    }

    if (savedHighContrast !== null) {
      setHighContrast(savedHighContrast === 'true');
    }

    if (savedFontSize) {
      setFontSize(savedFontSize as 'small' | 'medium' | 'large');
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--motion-duration',
      reduceMotion ? '0s' : '0.2s'
    );
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    
    document.documentElement.style.setProperty(
      '--base-font-size',
      fontSizeMap[fontSize]
    );
  }, [reduceMotion, highContrast, fontSize]);

  const handleSetReduceMotion = (value: boolean) => {
    setReduceMotion(value);
    localStorage.setItem('accessibility-reduce-motion', value.toString());
  };

  const handleSetHighContrast = (value: boolean) => {
    setHighContrast(value);
    localStorage.setItem('accessibility-high-contrast', value.toString());
  };

  const handleSetFontSize = (value: 'small' | 'medium' | 'large') => {
    setFontSize(value);
    localStorage.setItem('accessibility-font-size', value);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        reduceMotion,
        setReduceMotion: handleSetReduceMotion,
        highContrast,
        setHighContrast: handleSetHighContrast,
        fontSize,
        setFontSize: handleSetFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}