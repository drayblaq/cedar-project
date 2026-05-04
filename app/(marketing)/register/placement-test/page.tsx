import Link from "next/link";
import { getPlacementTestDto } from "@/lib/placement/get-placement-test-dto";
import PlacementTestClient from "./PlacementTestClient";

export default async function PlacementTestPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">Missing access link. Start from the registration confirmation page.</p>
        <Link href="/register" className="mt-4 inline-block text-emerald-600 hover:underline">
          Go to registration
        </Link>
      </div>
    );
  }

  const dto = await getPlacementTestDto();
  if (!dto) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-700">
          The placement test is temporarily unavailable. Ensure{" "}
          <code className="rounded bg-slate-100 px-1 text-sm">SUPABASE_SERVICE_ROLE_KEY</code> is set on the server and
          migrations have been applied.
        </p>
        <Link href="/" className="mt-6 inline-block text-emerald-600 hover:underline">
          Home
        </Link>
      </div>
    );
  }

  return <PlacementTestClient token={token} dto={dto} />;
}
