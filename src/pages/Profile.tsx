import { useState, useEffect } from 'react'
import { ProfileHeader } from '@/components/profile/profile-header'
import { SubscriptionCard } from '@/components/profile/subscription-card'
import { IntegrationsStatus } from '@/components/profile/integrations-status'
import { PreferencesPanel } from '@/components/profile/preferences-panel'
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog'
import { useToast } from '@/hooks/use-toast'

export default function Profile() {
  const { toast } = useToast()

  // Local state for user profile persistence
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('harmonize_user_profile')
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Ir. João Silva',
          email: 'joao@loja.com',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
          role: 'Mestre de Harmonia',
        }
  })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Persist user changes
  useEffect(() => {
    localStorage.setItem('harmonize_user_profile', JSON.stringify(user))
  }, [user])

  const handleUpdateProfile = (data: { name: string; avatar: string }) => {
    setUser((prev: any) => ({ ...prev, ...data }))
    toast({
      title: 'Perfil Atualizado',
      description: 'Suas informações foram salvas com sucesso.',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Header Section */}
      <ProfileHeader user={user} onEdit={() => setIsEditDialogOpen(true)} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column: Preferences */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-full">
              <PreferencesPanel />
            </div>
            <div className="h-full">
              <IntegrationsStatus />
            </div>
          </div>
        </div>

        {/* Right Column: Subscription & Status */}
        <div className="space-y-6">
          <SubscriptionCard />
        </div>
      </div>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        currentUser={user}
        onSave={handleUpdateProfile}
      />
    </div>
  )
}
