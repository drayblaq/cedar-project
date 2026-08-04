"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContactForm(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Please fill in all required fields" };
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address" };
  }
  if (message.length > 5000) {
    return { error: "Message too long (max 5000 characters)" };
  }

  // Rate limit: max 3 messages per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= 3) {
    return { error: "Too many submissions. Please try again later." };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, phone, message });

  if (error) return { error: "Failed to send message. Please try again." };

  // In-app notification (best-effort)
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      type: "contact",
      title: "New contact message",
      body: `${name} sent a message`,
      link: "/admin/messages",
    });
  } catch {
    // non-critical
  }

  // Email notification to admin (best-effort, never blocks form submission)
  try {
    await resend.emails.send({
      from: "Cedar Training Center <noreply@cedartrainingcenter.com>",
      to: "trainingcentercedar@gmail.com",
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
          <div style="background:#16a34a;padding:20px 24px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;font-size:16px;">New Contact Message</h2>
          </div>
          <div style="background:white;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px;">Name</td>
                <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:8px 0;color:#6b7280;font-size:13px;">Email</td>
                <td style="padding:8px 0;color:#111827;font-size:13px;">${email}</td>
              </tr>
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:8px 0;color:#6b7280;font-size:13px;">Phone</td>
                <td style="padding:8px 0;color:#111827;font-size:13px;">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">Message</td>
                <td style="padding:8px 0;color:#111827;font-size:13px;">${message}</td>
              </tr>
            </table>
            <div style="margin-top:20px;text-align:center;">
              <a href="https://portal.cedartrainingcenter.com/admin/messages"
                 style="background:#16a34a;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
                View in Admin →
              </a>
            </div>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:11px;margin:12px 0 0;">
            Cedar Training Center · cedartrainingcenter.com
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("[contact] Failed to send notification email:", emailError);
  }

  return { success: true };
}
