import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateUserPassword() {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash('Ricky@2025', 10)
    
    // Update the user's password
    const user = await prisma.users.update({
      where: {
        email: 'ricky_carruth@yahoo.com'
      },
      data: {
        password: hashedPassword
      }
    })
    
    console.log('Password updated successfully for user:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('Error: User not found with this email')
    } else {
      console.error('Error updating password:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

updateUserPassword()


