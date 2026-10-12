import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
})

export const config = {
  matcher: ["/curso/:path*", "/dashboard/:path*", "/ebook/:path*", "/forum/:path*", "/admin/:path*"],
}
