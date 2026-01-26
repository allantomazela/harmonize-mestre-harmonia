/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import MusicDetails from './pages/MusicDetails'
import PlaylistDetails from './pages/PlaylistDetails'
import Player from './pages/Player'
import Settings from './pages/Settings'
import CalendarPage from './pages/CalendarPage'
import LiveMode from './pages/LiveMode'
import { AudioPlayerProvider } from '@/hooks/use-audio-player-context'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AudioPlayerProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:id" element={<MusicDetails />} />
            <Route path="/playlists" element={<Dashboard />} />
            <Route path="/playlists/:id" element={<PlaylistDetails />} />
            <Route path="/player" element={<Player />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
          {/* Live Mode outside Main Layout for full screen experience */}
          <Route path="/live-mode" element={<LiveMode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AudioPlayerProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
