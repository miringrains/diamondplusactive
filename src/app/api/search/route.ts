import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Run each search independently so one failure doesn't break the rest
  const searchPromises = {
    groupCalls: prisma.group_calls.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        published: true
      },
      select: { id: true, title: true, description: true },
      take: 5
    }).catch(() => []),

    scriptVideos: prisma.script_videos.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        published: true
      },
      select: { id: true, title: true, description: true },
      take: 5
    }).catch(() => []),

    podcasts: prisma.dp_podcasts.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        published: true
      },
      select: { id: true, title: true, description: true },
      take: 5
    }).catch(() => []),

    challenges: prisma.challenge_videos.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        published: true
      },
      select: { id: true, title: true, description: true },
      take: 5
    }).catch(() => []),
  }

  try {
    const [groupCalls, scriptVideos, podcasts, challenges] = await Promise.all([
      searchPromises.groupCalls,
      searchPromises.scriptVideos,
      searchPromises.podcasts,
      searchPromises.challenges,
    ])

    const results = [
      ...groupCalls.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) : '',
        type: 'Group Call' as const,
        url: `/watch/group-calls/${item.id}`
      })),
      ...scriptVideos.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) : '',
        type: 'Script' as const,
        url: `/watch/scripts/${item.id}`
      })),
      ...podcasts.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) : '',
        type: 'Podcast' as const,
        url: `/podcasts`
      })),
      ...challenges.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description ? item.description.substring(0, 100) : '',
        type: 'Module' as const,
        url: `/watch/challenges/${item.id}`
      })),
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ results: [] })
  }
}
