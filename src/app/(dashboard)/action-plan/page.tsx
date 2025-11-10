'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, FileText, DollarSign, Users, BookOpen, Home, ChevronRight, ExternalLink } from 'lucide-react'
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
                <span className="text-[#111828] font-medium">Action Plans</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Action Plans
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access comprehensive action plans and resources to accelerate your success
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Resources Grid */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--ink)] mb-2">
              Available Action Plans
            </h2>
            <p className="text-[var(--ink)] text-base opacity-70">Choose from our comprehensive action plan resources</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* 90 Day Action Plan */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Target className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">90 Day Action Plan</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Get started strong</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">A comprehensive 90-day roadmap to jumpstart your real estate success</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <a href="https://drive.google.com/file/d/1zmqEv8N02NBQIr4W8lAJBvrpeklBjtmv/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Action Plan
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* $100k Framework */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <DollarSign className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">$100k Framework</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Scale your business</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Learn the proven framework for building a $100k real estate business</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <a href="https://docs.google.com/document/d/1Eiemi-dEkiO6cXhAHzNadZUibQt7eNM-2cKI56u-0Hw/edit?tab=t.0#heading=h.wwsy9hhw1i4m" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Framework
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* ISA SOPs */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Users className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">ISA SOPs</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Team procedures</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Standard operating procedures for building and managing your ISA team</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <a href="https://drive.google.com/drive/folders/1tLWg0a8260JAYSV9Z4sOjxDoNWwmhGkA" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View SOPs
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Scripts */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <BookOpen className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Scripts</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Proven dialogues</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Battle-tested scripts and dialogues for every situation</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/scripts">
                    View Scripts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
