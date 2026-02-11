import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { sql } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        if (!email) return null

        // Find or create user
        const existing = await sql`SELECT id, email, name, role, credits FROM users WHERE email = ${email}`

        if (existing.length > 0) {
          const user = existing[0]
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            credits: user.credits,
          }
        }

        // Create new user
        const newUser = await sql`
          INSERT INTO users (email, credits) VALUES (${email}, 1) RETURNING id, email, name, role, credits
        `
        const user = newUser[0]
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          credits: user.credits,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || 'user'
        token.credits = (user as { credits?: number }).credits || 0
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { credits?: number }).credits = token.credits as number
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
