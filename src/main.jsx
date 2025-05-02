import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import './index.css'
import App from './App.jsx'


import { supabase } from './services/supabaseClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </StrictMode>
)
