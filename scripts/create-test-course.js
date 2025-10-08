// Script to create a test course with Mux integration
// Run with: node scripts/create-test-course.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestCourse() {
  try {
    // Find admin user
    const adminUser = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.')
      process.exit(1)
    }

    console.log(`Using admin user: ${adminUser.email}`)

    // Create a test course
    const course = await prisma.courses.create({
      data: {
        title: "Mux Integration Test Course",
        description: "Test course to verify Mux video player integration",
        slug: "mux-test-course",
        published: true
      }
    })

    console.log(`Created course: ${course.title} (ID: ${course.id})`)
    console.log(`Course URL: /courses/${course.slug}`)
    console.log(`Admin URL: /admin/courses/${course.id}`)
    
    console.log('\nNext steps:')
    console.log('1. Go to the admin panel: /admin/courses/' + course.id)
    console.log('2. Upload a video lesson using the "Add Lesson" button')
    console.log('3. The video will be processed by Mux automatically')
    console.log('4. Once ready, test playback on the course page')

  } catch (error) {
    console.error('Error creating test course:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCourse()
