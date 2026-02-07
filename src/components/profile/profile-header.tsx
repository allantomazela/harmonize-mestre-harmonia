import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, ShieldCheck, CalendarClock } from 'lucide-react'

interface ProfileHeaderProps {
  user: {
    name: string
    email: string
    avatar: string
    role: string
  }
  onEdit: () => void
}

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Cover Background */}
      <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-background border-b border-border/50">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="px-6 pb-6 pt-0 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 relative z-10">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-card shadow-xl">
            <AvatarImage src={user.avatar} className="object-cover" />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div
            className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-card rounded-full"
            title="Online"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-1 mb-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {user.name}
            </h1>
            <Badge
              variant="secondary"
              className="w-fit border-primary/20 text-primary bg-primary/10"
            >
              <ShieldCheck className="w-3 h-3 mr-1" /> {user.role}
            </Badge>
          </div>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <CalendarClock className="w-3 h-3" /> Membro desde Jan 2026
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-2 w-full md:w-auto">
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1 md:flex-none gap-2 hover:border-primary/50"
          >
            <Edit2 className="w-4 h-4" /> Editar Perfil
          </Button>
        </div>
      </div>
    </div>
  )
}
