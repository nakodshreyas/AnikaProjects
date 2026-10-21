import cron from "node-cron";
import { supabaseServer, isSupabaseServerConfigured } from "./supabaseServer";

export function startCronJobs() {
  if (!isSupabaseServerConfigured) {
    console.warn("⚠️ Supabase server credentials are not configured. Cron jobs will be skipped.");
    return;
  }

  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Supabase cron started:", new Date().toISOString());

    try {
      const { data, error } = await supabaseServer
        .from("projects")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ Supabase query failed:", error.message);
        return;
      }

      console.log("✅ Supabase is active.");
      console.log("📊 Query result:", data);
    } catch (error) {
      console.error("❌ Cron error:", error);
    }
  });

  console.log("🚀 Supabase cron job started — runs every 5 minutes");
}