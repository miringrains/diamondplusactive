'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSearch, Clock, Home, ChevronRight } from 'lucide-react'
import { PageHeader, PageHeaderPresets } from '@/components/layout'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function BusinessAuditPage() {
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
                <span className="text-[#111828] font-medium">Monthly Business Audit</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Monthly Business Audit
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track and analyze your business metrics
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        <Card className="card max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--brand)]">
                <FileSearch className="h-6 w-6 text-[var(--ink-inverse)]" />
              </div>
              <CardTitle className="text-xl text-[var(--ink-inverse)]">
                Business Performance Review
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <Clock className="h-16 w-16 mx-auto mb-6 text-[var(--brand)]/50" />
              <h2 className="text-2xl font-semibold text-[var(--ink-inverse)] mb-4">
                Coming Soon
              </h2>
              <p className="text-[var(--ink-inverse)]/70 max-w-2xl mx-auto">
                We're developing a comprehensive business audit tool that will help you track 
                your key metrics, identify growth opportunities, and measure your progress 
                month over month.
              </p>
              <div className="mt-8 space-y-4">
                <p className="text-sm font-semibold text-[var(--ink-inverse)]">
                  Features in development:
                </p>
                <ul className="text-sm text-[var(--ink-inverse)]/70 space-y-2 max-w-md mx-auto text-left">
                  <li className="flex items-start">
                    <span className="text-[var(--brand)] mr-2">•</span>
                    Monthly performance metrics dashboard
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--brand)] mr-2">•</span>
                    Goal tracking and progress visualization
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--brand)] mr-2">•</span>
                    Automated insights and recommendations
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--brand)] mr-2">•</span>
                    Comparative analysis with previous months
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--brand)] mr-2">•</span>
                    Custom action plans based on your data
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
