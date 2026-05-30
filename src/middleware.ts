
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/quiz/:id*"],
});

export const config = {
  matcher: ["/((?!.+//.[w]+$|_next).)", "/", "/(api|trpc)(.)"],
};
