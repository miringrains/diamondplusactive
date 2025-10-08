import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  console.log('Search query:', query)

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Search across different content types
    const [groupCalls, scriptVideos, podcasts, modules] = await Promise.all([
      // Search group calls
      prisma.group_calls.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          published: true
        },
        select: {
          id: true,
          title: true,
          description: true
        },
        take: 3
      }),
      
      // Search script videos
      prisma.script_videos.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          published: true
        },
        select: {
          id: true,
          title: true,
          description: true
        },
        take: 3
      }),
      
      // Search podcasts
      prisma.podcasts.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          published: true
        },
        select: {
          id: true,
          title: true,
          description: true
        },
        take: 3
      }),
      
      // Search modules
      prisma.modules.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true
        },
        take: 3
      })
    ])

    console.log('Search results found:', {
      groupCalls: groupCalls.length,
      scriptVideos: scriptVideos.length,
      podcasts: podcasts.length,
      modules: modules.length
    })

    // Format results with type and URL
    const results = [
      ...groupCalls.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) + '...' : '',
        type: 'Group Call' as const,
        url: `/watch/group-calls/${item.id}`
      })),
      ...scriptVideos.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) + '...' : '',
        type: 'Script' as const,
        url: `/watch/scripts/${item.id}`
      })),
      ...podcasts.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) + '...' : '',
        type: 'Podcast' as const,
        url: `/podcasts`
      })),
      ...modules.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) + '...' : '',
        type: 'Module' as const,
        url: `/dashboard` // Will need to update this when module pages exist
      }))
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [] })
  }
}
