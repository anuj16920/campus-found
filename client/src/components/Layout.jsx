import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'

export default function Layout() {
  const { verifyAuth } = useAuthStore()

  useEffect(() => {
    verifyAuth()
  }, [])

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
