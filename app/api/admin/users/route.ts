import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  console.log("API route called for User List");

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ users: data.users });
}
