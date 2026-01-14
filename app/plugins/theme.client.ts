export default defineNuxtPlugin(() => {
  if (process.client) {
    // Verifica o tema salvo no localStorage ou usa o tema do sistema
    const savedTheme = localStorage.getItem('theme')
    const html = document.documentElement
    
    if (savedTheme) {
      // Usa o tema salvo
      if (savedTheme === 'light') {
        html.classList.add('light')
        html.classList.remove('dark')
      } else {
        html.classList.add('dark')
        html.classList.remove('light')
      }
    } else {
      // Verifica a preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (prefersDark) {
        html.classList.add('dark')
        html.classList.remove('light')
        localStorage.setItem('theme', 'dark')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }
})
