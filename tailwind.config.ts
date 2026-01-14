import type { Config } from 'tailwindcss'

const config: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core semantic tokens - usando variáveis CSS
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Brand / primary actions
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },

        // Secondary surfaces
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },

        // Accent
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },

        // Muted content and surfaces
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },

        // Cards / popovers
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },

        // Status / feedback
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        destructiveSurface: 'var(--destructive-surface)',

        // UI primitives
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Neutrals
        white: '#FFFFFF'
      }
    }
  }
}

export default config


