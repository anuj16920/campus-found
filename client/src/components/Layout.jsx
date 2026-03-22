import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'

export default function Layout() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      {/* pt-14 for top header, pb-16 for bottom nav */}
      <main className="pt-14 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
