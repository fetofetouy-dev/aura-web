import NextAuth, { NextAuthOptions, Account, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"
import { supabaseAdmin } from "@/lib/supabase"
import { refreshAccessToken } from "@/lib/google-client"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request Gmail + Calendar scopes
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
          // These two are critical to always get a refresh_token
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    /**
     * signIn: called right after Google redirects back.
     * We persist the refresh_token to Supabase so automations
     * can use it server-side even when the user is offline.
     */
    async signIn({ account, profile }: { account: Account | null; profile?: { email?: string } }) {
      if (account?.provider === "google" && account.refresh_token && account.access_token && profile?.email) {
        try {
          await supabaseAdmin.from("google_credentials").upsert(
            {
              user_email: profile.email, // Real email, matches session.user.email
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_email" }
          )
        } catch (err) {
          console.error("[NextAuth] Failed to persist Google credentials:", err)
          // Don't block sign-in if DB write fails
        }
      }
      return true
    },

    /**
     * jwt: runs on every session check.
     * Stores tokens in the JWT and refreshes if expired.
     */
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // First sign-in: store tokens from Google
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        }
      }

      // Token still valid
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt - 60) {
        return token
      }

      // Token expired: refresh it
      if (!token.refreshToken) {
        return { ...token, error: "NoRefreshToken" }
      }

      try {
        const refreshed = await refreshAccessToken(token.refreshToken)
        return {
          ...token,
          accessToken: refreshed.accessToken,
          expiresAt: refreshed.expiresAt,
          error: undefined,
        }
      } catch (err) {
        console.error("[NextAuth] Token refresh failed:", err)
        return { ...token, error: "RefreshFailed" }
      }
    },

    /**
     * session: shape the session object exposed to the client.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
