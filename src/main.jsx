import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TeaserPage from './TeaserPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeaserPage />} />
        <Route path="/hunt" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
