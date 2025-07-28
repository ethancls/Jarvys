/**
 * Configuration du thème Jarvys
 * Centralise les couleurs et styles utilisés dans l'application
 */

export const colors = {
  primary: {
    50: '#fff1f1',
    100: '#ffe1e1',
    200: '#ffc7c7',
    300: '#ffa0a0',
    400: '#ff6b6b',
    500: '#f83b3b',
    600: '#e51d1d',
    700: '#c11414',
    800: '#a01414',
    900: '#841717',
    950: '#480707',
  },
  secondary: {
    50: '#fff9eb',
    100: '#ffefc6',
    200: '#ffdb89',
    300: '#ffc14e',
    400: '#ffa41b',
    500: '#f98200',
    600: '#dd6400',
    700: '#b74a00',
    800: '#943a06',
    900: '#7a310b',
    950: '#461a05',
  },
  accent: {
    50: '#ecfdff',
    100: '#cff6ff',
    200: '#a2eeff',
    300: '#63e1ff',
    400: '#1cceff',
    500: '#00b5f0',
    600: '#0092ca',
    700: '#0074a3',
    800: '#066286',
    900: '#0b5270',
    950: '#03344a',
  },
  neutral: {
    50: '#f7f7f7',
    100: '#e3e3e3',
    200: '#c8c8c8',
    300: '#a4a4a4',
    400: '#818181',
    500: '#666666',
    600: '#515151',
    700: '#434343',
    800: '#383838',
    900: '#313131',
    950: '#1a1a1a',
  },
  background: {
    light: '#ffffff',
    dark: '#121212',
  },
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const fonts = {
  sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
};

export const transitions = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
};