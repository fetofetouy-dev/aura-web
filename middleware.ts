export { default } from "next-auth/middleware"

export const config = {
  /**
   * Protect all /backoffice/* routes.
   * If the user isn't logged in, NextAuth redirects to /login automatically.
   */
  matcher: ["/backoffice/:path*"],
}
