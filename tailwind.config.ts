import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'ink-black': '#1A1A1A',
        'parchment-white': '#FEFEFE',
        'quill-blue': '#2563EB',
        'quill-blue-light': '#93C5FD',
        'whisper-gray': '#6B7280',
        
        // Secondary Colors (Feedback System)
        'suggestion-green': '#10B981',
        'warning-amber': '#F59E0B',
        'error-crimson': '#EF4444',
        'focus-purple': '#7C3AED',
        
        // Neutral Colors
        'document-gray': '#F9FAFB',
        'border-gray': '#E5E7EB',
        'text-gray': '#374151',
        'muted-gray': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        // Typography Hierarchy
        'h1': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h2': ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'h3': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'code': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'ui-label': ['13px', { lineHeight: '18px', fontWeight: '500' }],
      },
      boxShadow: {
        'hover-card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'focus-outline': '0 0 0 2px #7C3AED',
      },
      borderRadius: {
        'card': '6px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 100ms ease-in',
        'slide-up': 'slideUp 150ms ease-out',
        'pulse-gentle': 'pulseGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
