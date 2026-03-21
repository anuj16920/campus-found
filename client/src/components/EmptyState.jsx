import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function EmptyState({
  title = 'Nothing here',
  description = 'Start by adding something new.',
  actionLabel,
  actionLink,
  icon: Icon = Search,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-dark-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-dark-400 text-center max-w-md mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
