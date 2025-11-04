import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="text-muted">
            We&apos;ve sent you a confirmation link. Please click the link in your email to verify your account.
          </p>
        </div>
        <Link href="/auth/login">
          <Button className="w-full bg-primary hover:bg-primary-light hover:cursor-pointer">Back to Login</Button>
        </Link>
      </div>
    </div>
  )
}
