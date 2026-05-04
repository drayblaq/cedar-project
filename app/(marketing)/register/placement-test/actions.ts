"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function submitPlacementAttempt(input: {
  placementToken: string;
  testId: string;
  startedAtIso: string;
  selections: Record<string, string>;
}) {
  const { placementToken, testId, startedAtIso, selections } = input;
  if (!placementToken || !testId || !selections || Object.keys(selections).length === 0) {
    return { error: "Invalid submission" };
  }

  try {
    const admin = createAdminClient();
    const { data: student, error: sErr } = await admin
      .from("students")
      .select("id, status, placement_access_token")
      .eq("placement_access_token", placementToken)
      .maybeSingle();
    if (sErr || !student?.id) return { error: "Invalid or expired link" };
    if (student.status !== "pending") return { error: "This application is no longer eligible for the online test" };

    const { data: expectedQuestions, error: eqErr } = await admin
      .from("questions")
      .select("id, points")
      .eq("test_id", testId)
      .order("sort_order", { ascending: true });
    if (eqErr || !expectedQuestions?.length) return { error: "Test not found" };
    const expectedIds = new Set(expectedQuestions.map((q) => q.id));
    const selectionKeys = new Set(Object.keys(selections));
    if (expectedIds.size !== selectionKeys.size || ![...expectedIds].every((id) => selectionKeys.has(id))) {
      return { error: "Please answer every question before submitting." };
    }

    const questionIds = Object.keys(selections);
    const ptsByQ = new Map(expectedQuestions.map((q) => [q.id, Number(q.points) || 1]));

    const { data: answers, error: aErr } = await admin
      .from("answers")
      .select("id, question_id, is_correct")
      .in("question_id", questionIds);
    if (aErr || !answers) return { error: "Could not score test" };

    const correctByQuestion = new Map<string, string>();
    for (const a of answers) {
      if (a.is_correct) correctByQuestion.set(a.question_id as string, a.id as string);
    }

    let earned = 0;
    let maxScore = 0;
    for (const qid of questionIds) {
      const pts = ptsByQ.get(qid) ?? 1;
      maxScore += pts;
      const correctId = correctByQuestion.get(qid);
      if (correctId && selections[qid] === correctId) earned += pts;
    }

    const started = new Date(startedAtIso).getTime();
    const timeTakenSeconds = Math.max(
      0,
      Math.round((Date.now() - started) / 1000)
    );

    const { error: insErr } = await admin.from("test_attempts").insert({
      student_id: student.id,
      test_id: testId,
      score: earned,
      max_score: maxScore || 1,
      time_taken_seconds: timeTakenSeconds,
    });
    if (insErr) return { error: insErr.message };

    return {
      error: null as null,
      score: earned,
      maxScore: maxScore || 1,
      percent: maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0,
      timeTakenSeconds,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Submission failed" };
  }
}
