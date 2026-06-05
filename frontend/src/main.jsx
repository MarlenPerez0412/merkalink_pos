import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './routes/router'

const temaSistema = localStorage.getItem('temaSistema') || 'claro';
if (
  temaSistema === 'oscuro' ||
  (temaSistema === 'sistema' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('theme-dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
