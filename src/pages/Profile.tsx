import { useState, useEffect } from 'react'
import { ProfileHeader } from '@/components/profile/profile-header'
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header Section */}
      <ProfileHeader user={user} onEdit={() => setIsEditDialogOpen(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance & Settings */}
        <PreferencesPanel />

        {/* Cloud Integration */}
        <IntegrationsStatus />
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
