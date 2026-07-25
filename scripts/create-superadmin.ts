/**
 * Crea (o promueve a) la primera cuenta superadmin.
 *
 * Uso:
 *   npm run create-admin -- tu@email.com "una-contraseña-segura" "Tu Nombre"
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const [, , email, password, ...nameParts] = process.argv;
const fullName = nameParts.join(" ") || null;

if (!email || !password) {
  console.error('Uso: npm run create-admin -- email password "Nombre Apellido"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // ¿Ya existe un usuario con ese email?
  const { data: existingPage, error: listErr } = await sb.auth.admin.listUsers();
  if (listErr) throw listErr;
  let userId = existingPage.users.find((u) => u.email === email)?.id;

  if (userId) {
    console.log("ℹ️ Ya existe un usuario con ese email, actualizando contraseña y rol…");
    await sb.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user!.id;
    console.log("✅ Usuario creado:", userId);
  }

  const { error: profileErr } = await sb
    .from("profiles")
    .upsert({ id: userId, role: "superadmin", full_name: fullName });
  if (profileErr) throw profileErr;

  console.log(`✅ ${email} es superadmin. Ya podés entrar en /login.`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
