const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@diamondplus.com' }
    })

    if (existingUser) {
      console.log('Test user already exists')
      console.log('Email: test@diamondplus.com')
      console.log('Password: TestUser123!')
      return
    }

    // Create password hash
    const hashedPassword = await bcrypt.hash('TestUser123!', 10)

    // Create user with concatenated name (firstName + lastName)
    const user = await prisma.users.create({
      data: {
        email: 'test@diamondplus.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        emailVerified: new Date()
      }
    })

    console.log('Test user created successfully:')
    console.log('Email: test@diamondplus.com')
    console.log('Password: TestUser123!')
    console.log('Role:', user.role)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
