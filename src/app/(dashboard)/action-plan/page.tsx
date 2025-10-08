'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Rocket, Home, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ActionPlanPage() {
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
                <span className="text-[#111828] font-medium">Action Plan</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Action Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create and track your personalized action plan
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        <Card className="card max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--brand)]">
                <Target className="h-6 w-6 text-[var(--ink-inverse)]" />
              </div>
              <CardTitle className="text-xl text-[var(--ink-inverse)]">
                Your Personal Success Roadmap
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <Rocket className="h-16 w-16 mx-auto mb-6 text-[var(--brand)]/50" />
              <h2 className="text-2xl font-semibold text-[var(--ink-inverse)] mb-4">
                Action Planning Feature Coming Soon
              </h2>
              <p className="text-[var(--ink-inverse)]/70 max-w-2xl mx-auto mb-8">
                We're building an interactive action planning tool that will help you create, 
                track, and achieve your real estate goals with personalized strategies and 
                milestone tracking.
              </p>
              
              <div className="bg-white/10 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-[var(--ink-inverse)] mb-4">
                  What to expect:
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-medium text-[var(--ink-inverse)] mb-2">Goal Setting</h4>
                    <p className="text-sm text-[var(--ink-inverse)]/70">
                      Define clear, measurable objectives for your business growth
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--ink-inverse)] mb-2">Action Steps</h4>
                    <p className="text-sm text-[var(--ink-inverse)]/70">
                      Break down goals into actionable daily and weekly tasks
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--ink-inverse)] mb-2">Progress Tracking</h4>
                    <p className="text-sm text-[var(--ink-inverse)]/70">
                      Monitor your advancement with visual progress indicators
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--ink-inverse)] mb-2">Accountability</h4>
                    <p className="text-sm text-[var(--ink-inverse)]/70">
                      Stay on track with reminders and milestone celebrations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
