import { createClient } from "@/lib/supabase/server";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, message, read, created_at")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    read: boolean;
    created_at: string;
  }[];

  return <MessagesClient messages={messages} />;
}
