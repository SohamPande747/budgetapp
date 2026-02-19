'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function LogoutButton({
  collapsed,
}: {
  collapsed?: boolean
}) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <button onClick={handleLogout} className="logout-btn">
      {collapsed ?  <LogOut/>: 'Logout'}
    </button>
  )
}