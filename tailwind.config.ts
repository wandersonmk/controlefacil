import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

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
      },
      animation: {
        'gradient': 'gradient 4s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          },
        },
      }
    }
  },
  plugins: [
    plugin(function({ addComponents, addUtilities }) {
      addComponents({
        // Estilos globais para selects (dropdowns)
        'select': {
          'appearance': 'none',
          'background-repeat': 'no-repeat',
          'background-position': 'right 0.5rem center',
          'background-size': '1rem',
          'padding-right': '2.5rem',
          'background-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        },
        '.dark select': {
          'background-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        },
        'select option': {
          'background-color': 'var(--select-bg)',
          'color': 'var(--foreground)',
        },
        // Classe customizada para dropdowns de unidade
        '.select-unit': {
          'appearance': 'none',
          'background-repeat': 'no-repeat',
          'background-position': 'right 0.3rem center',
          'background-size': '0.8rem',
          'background-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        },
        '.dark .select-unit': {
          'background-image': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        },
      })
      
      addUtilities({
        // Bordas adaptáveis para cards
        '.border-adaptive': {
          'border-color': 'var(--border)',
        },
        '.border-adaptive-light': {
          'border-color': 'rgba(226, 232, 240, 0.3)',
          '.dark &': {
            'border-color': 'rgba(39, 39, 42, 0.2)',
          }
        },
        '.border-primary-adaptive': {
          'border-color': 'rgba(129, 98, 255, 0.3)',
          '.dark &': {
            'border-color': 'rgba(129, 98, 255, 0.15)',
          }
        },
        '.border-success-adaptive': {
          'border-color': 'rgba(34, 197, 94, 0.3)',
          '.dark &': {
            'border-color': 'rgba(34, 197, 94, 0.15)',
          }
        },
      })
    })
  ]
}

export default config


