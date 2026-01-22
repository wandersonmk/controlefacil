// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'
import { dirname, resolve as resolvePath } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  routeRules: {
    // Páginas públicas mantêm SSR
    '/': { ssr: false },
    '/login': { ssr: true },
    '/obrigado': { ssr: true },
    '/auth/**': { ssr: true },
    // Redirect /dashboard para a home
    '/dashboard': { redirect: '/' },
    // Todas as outras páginas protegidas sem SSR (evita flash de conteúdo)
    '/ajuda': { ssr: false },
    '/ajuste-da-ia': { ssr: false },
    '/assinatura': { ssr: false },
    '/calculadora': { ssr: false },
    '/cardapio': { ssr: false },
    '/clientes': { ssr: false },
    '/comunidade': { ssr: false },
    '/configuracoes': { ssr: false },
    '/entradas': { ssr: false },
    '/estoque': { ssr: false },
    '/fornecedores': { ssr: false },
    '/mentor-ia': { ssr: false },
    '/pedidos': { ssr: false },
    '/planos': { ssr: false },
    '/produtos': { ssr: false },
    '/relatorios': { ssr: false },
    '/saidas': { ssr: false },
    '/tokens': { ssr: false }
  },
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : 'node-server'
  },
  vite: {
    build: {
      modulePreload: false
    }
  },
  tailwindcss: {
    cssPath: resolvePath(__dirname, 'assets/css/tailwind.css')
  },
  css: ['@fortawesome/fontawesome-svg-core/styles.css'],
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/fvc.png'
        }
      ],
      meta: [
        {
          property: 'og:image',
          content: '/capa.png'
        },
        {
          property: 'og:image:width',
          content: '1200'
        },
        {
          property: 'og:image:height',
          content: '630'
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:image',
          content: '/capa.png'
        }
      ],
      script: [
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
          defer: true
        },
        {
          src: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.3/jspdf.plugin.autotable.min.js',
          defer: true
        }
      ]
    }
  },
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    supabaseServiceRoleKey: process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      supabaseUrl:
        process.env.NUXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL,
      supabaseAnonKey:
        process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY
    }
  }
})