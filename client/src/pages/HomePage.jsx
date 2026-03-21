import Feed from '../components/Feed'
import FilterBar from '../components/FilterBar'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Lost & Found
        </h1>
        <p className="text-dark-400">
          Help reunite items with their owners. Browse, report, and claim lost items on campus.
        </p>
      </div>

      <FilterBar />

      <div className="mt-8">
        <Feed />
      </div>
    </div>
  )
}
