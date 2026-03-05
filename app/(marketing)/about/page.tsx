import Link from"next/link";

export const metadata = {
  title:"About | Cedar Training Center",
  description:"Learn about Cedar Training Center, English language training in Cotonou, Benin.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        About us
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Cedar Training Center
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">
        Cedar Training Center (CTC) is an English language training center
        based in Cotonou, Benin. We help individuals and professionals improve
        their English from beginner to advanced levels, with options for
        IELTS and TOEFL preparation.
      </p>

      <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">
          Our mission
        </h2>
        <p className="mt-3 leading-relaxed text-slate-600">
          To provide quality, accessible English education that supports
          learners in their academic, professional, and personal goals—whether
          they plan to study abroad, work in international environments, or
          simply communicate with confidence.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900">
          What we offer
        </h2>
        <ul className="mt-4 space-y-3 text-slate-600">
          {["Structured levels from Beginner to Advanced","IELTS and TOEFL preparation (when available)","Experienced instructors and a supportive learning environment","Tracked progress and clear feedback for every student",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 text-slate-600">
        Explore our{""}
        <Link href="/courses" className="font-medium text-emerald-600 hover:underline">
          courses
        </Link>{""}
        or{""}
        <Link href="/register" className="font-medium text-emerald-600 hover:underline">
          register
        </Link>{""}
        to get started.
      </p>
    </div>
  );
}
