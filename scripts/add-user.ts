import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Ricky@2025', 10)
    
    // Create the user
    const user = await prisma.users.create({
      data: {
        email: 'ricky_carruth@yahoo.com',
        password: hashedPassword,
        firstName: 'Ricky',
        lastName: 'Carruth',
        role: 'USER'
      }
    })
    
    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Error: A user with this email already exists')
    } else {
      console.error('Error creating user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

addUser()
