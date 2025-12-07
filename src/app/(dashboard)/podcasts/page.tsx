import { Home, ChevronRight } from "lucide-react"
import { getRecentPodcasts } from "@/lib/loaders/dashboard"
import Link from "next/link"
import PodcastsClient from "./podcasts-client"

// Force dynamic rendering for Vercel (requires database access)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PodcastsPage() {
  // Load podcasts server-side (safe, works with auth)
  const podcasts = await getRecentPodcasts()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-[#111828] hover:opacity-80 transition-opacity"
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-2 text-[#111828]" />
                <span className="text-[#111828] font-medium">Diamond Stories Podcast</span>
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Diamond Stories Podcast
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the specific strategies of members who are achieving extraordinary breakthroughs in scaling
            </p>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Podcast Player with Integrated Playlist */}
        <section className="mb-16">
          <PodcastsClient initialPodcasts={podcasts} />
        </section>
      </div>
    </div>
  )
}
