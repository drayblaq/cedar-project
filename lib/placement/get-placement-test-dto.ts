import { createAdminClient } from "@/lib/supabase/admin";

export type PlacementOptionDto = { id: string; label: string };
export type PlacementQuestionDto = {
  id: string;
  prompt: string;
  points: number;
  options: PlacementOptionDto[];
};

export type PlacementTestDto = {
  testId: string;
  timeLimitSeconds: number;
  questions: PlacementQuestionDto[];
};

const SLUG = "english-placement";

export async function getPlacementTestDto(): Promise<PlacementTestDto | null> {
  try {
    const admin = createAdminClient();
    const { data: test, error: testErr } = await admin
      .from("tests")
      .select("id, time_limit_seconds")
      .eq("slug", SLUG)
      .eq("is_published", true)
      .maybeSingle();
    if (testErr || !test) return null;

    const { data: questions, error: qErr } = await admin
      .from("questions")
      .select("id, prompt, points, sort_order")
      .eq("test_id", test.id)
      .order("sort_order", { ascending: true });
    if (qErr || !questions?.length) return null;

    const questionIds = questions.map((q) => q.id);
    const { data: answers, error: aErr } = await admin
      .from("answers")
      .select("id, question_id, label, sort_order")
      .in("question_id", questionIds)
      .order("sort_order", { ascending: true });
    if (aErr || !answers) return null;

    const byQuestion = new Map<string, PlacementOptionDto[]>();
    for (const a of answers) {
      const list = byQuestion.get(a.question_id) ?? [];
      list.push({ id: a.id, label: a.label });
      byQuestion.set(a.question_id, list);
    }

    return {
      testId: test.id,
      timeLimitSeconds: test.time_limit_seconds ?? 600,
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        points: q.points ?? 1,
        options: byQuestion.get(q.id) ?? [],
      })),
    };
  } catch {
    return null;
  }
}
