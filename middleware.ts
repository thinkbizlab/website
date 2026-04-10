export { default } from 'next-auth/middleware'

// Protect all /admin routes — redirects to /login if not authenticated
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
