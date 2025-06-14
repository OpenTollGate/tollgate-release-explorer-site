export const theme = {
  colors: {
    // Primary colors
    primary: '#ff6b35',
    primaryLight: '#ff8c61',
    primaryDark: '#e55a2b',
    
    // Background colors
    background: '#1a1a2e',
    backgroundSecondary: '#16213e',
    backgroundTertiary: '#0f172a',
    
    // Text colors
    text: '#f8f8f8',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    
    // UI colors
    border: '#333333',
    borderLight: '#444444',
    
    // Card colors
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    cardBackgroundHover: 'rgba(255, 255, 255, 0.08)',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Channel colors
    stable: '#10b981',
    beta: '#f59e0b',
    alpha: '#ef4444',
    dev: '#8b5cf6'
  },
  
  // Typography
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Layout
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border radius
  radii: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  }
};

// Helper function to get channel color
export const getChannelColor = (channel) => {
  return theme.colors[channel] || theme.colors.textSecondary;
};

// Helper function to get responsive breakpoint
export const breakpoint = (size) => `@media (min-width: ${theme.breakpoints[size]})`;