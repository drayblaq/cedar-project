import { createClient } from "@/lib/supabase/server";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const supabase = await createClient();

  const [{ data: messagesData }, { data: notifsData }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id, name, email, phone, message, read, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const messages = (messagesData ?? []) as {
    id: string; name: string; email: string; phone: string | null;
    message: string; read: boolean; created_at: string;
  }[];

  const notifications = (notifsData ?? []) as {
    id: string; type: string | null; title: string; body: string | null;
    link: string | null; is_read: boolean; created_at: string;
  }[];

  return <MessagesClient messages={messages} notifications={notifications} />;
}
