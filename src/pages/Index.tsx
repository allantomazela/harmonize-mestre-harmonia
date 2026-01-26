/* Redirect Page - Handles initial navigation logic */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Index = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // In a real app, check auth token here.
    // For demo, redirect to login.
    navigate('/login')
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-full mb-4"></div>
        <p className="text-muted-foreground">Carregando Harmonize...</p>
      </div>
    </div>
  )
}

export default Index
