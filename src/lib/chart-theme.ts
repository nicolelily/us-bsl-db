export const chartTheme = {
  colors: {
    primary: '#7DCBC4', // Logo teal
    secondary: '#5D2A1A', // Dark brown
    accent: '#D2691E', // Lighter brown
    background: {
      light: '#FFFFFF',
      dark: '#1C1C1C'
    },
    text: {
      light: '#374151',
      dark: '#E5E7EB'
    },
    axis: {
      light: '#9CA3AF',
      dark: '#4B5563'
    }
  },
  fonts: {
    sans: 'var(--font-sans)', // Using system default
    mono: 'var(--font-mono)'
  },
  chart: {
    margins: {
      small: { top: 10, right: 10, bottom: 10, left: 10 },
      default: { top: 20, right: 30, left: 120, bottom: 20 },
      large: { top: 30, right: 40, left: 150, bottom: 30 }
    },
    axis: {
      tickSize: 6,
      tickPadding: 3,
      tickRotate: 0
    },
    transitions: {
      duration: 250
    }
  }
} as const;

export type ChartTheme = typeof chartTheme;

export function getChartStyle(isDarkMode: boolean = false) {
  return {
    backgroundColor: isDarkMode ? chartTheme.colors.background.dark : chartTheme.colors.background.light,
    color: isDarkMode ? chartTheme.colors.text.dark : chartTheme.colors.text.light,
    fontFamily: chartTheme.fonts.sans,
    fontSize: 12,
    overflow: "visible"
  };
}