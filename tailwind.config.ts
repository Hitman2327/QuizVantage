import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['PT Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: '#F5F5FA',
        foreground: '#1A1A2E',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        primary: {
          DEFAULT: '#5353C4',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EAEAF5',
          foreground: '#5353C4',
        },
        muted: {
          DEFAULT: '#F0F0F7',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#3D92ED',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#E2E2F0',
        input: '#E2E2F0',
        ring: '#5353C4',
        chart: {
          '1': '#5353C4',
          '2': '#3D92ED',
          '3': '#10B981',
          '4': '#F59E0B',
          '5': '#EC4899',
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          foreground: '#5353C4',
          primary: '#5353C4',
          'primary-foreground': '#FFFFFF',
          accent: '#F5F5FA',
          'accent-foreground': '#5353C4',
          border: '#E2E2F0',
          ring: '#5353C4',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-right': 'fade-in-right 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
