import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** Punto de entrada post-login: manda a cada usuario a su panel según el rol. */
export default async function RedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "superadmin" ? "/admin" : "/panel");
}
