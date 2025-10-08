import RegisterForm from './register-form'
import Image from "next/image"
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Check if already logged in
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  const message = searchParams?.message as string
  const error = searchParams?.error as string
  
  return (
    <div className="flex h-screen overflow-hidden" data-auth-page>
      {/* Left Column - Form */}
      <div className="flex w-full items-center justify-center px-8 md:w-1/2 lg:px-16 bg-[#1F1F1F] text-white">
        <RegisterForm message={message} error={error} />
      </div>

      {/* Right Column - Video */}
      <div className="hidden md:block md:w-1/2 relative bg-black">
        <video
          src="/bluediamond.mp4"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          controls={false}
          className="w-full h-full object-cover"
        >
          <source src="/bluediamond.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}