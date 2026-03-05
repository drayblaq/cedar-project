import Link from"next/link";

export const metadata = {
  title:"Courses & English Levels | Cedar Training Center",
  description:"English levels from Beginner to Advanced, plus IELTS and TOEFL preparation at Cedar Training Center, Cotonou.",
};

const LEVELS = [
  { name:"Beginner", order: 1, description:"Build your foundation in English: alphabet, basic vocabulary, and simple sentences." },
  { name:"Elementary", order: 2, description:"Expand vocabulary and grammar for everyday situations and short conversations." },
  { name:"Pre-Intermediate", order: 3, description:"Develop confidence in reading, writing, and speaking on familiar topics." },
  { name:"Intermediate", order: 4, description:"Handle most daily and work situations with fluency and clarity." },
  { name:"Upper-Intermediate", order: 5, description:"Use English effectively in complex discussions and written texts." },
  { name:"Advanced", order: 6, description:"Near-native fluency for academic and professional use." },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Curriculum
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Courses & English Levels
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        We offer structured programs at six levels. Your level is assessed at enrollment so you join the right class.
      </p>

      <div className="mt-12 space-y-4">
        {LEVELS.map((level, i) => (
          <div
            key={level.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:border-emerald-200 hover:shadow-lg:border-emerald-800"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700">
                {level.order}
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {level.name}
                </h2>
                <span className="text-sm text-slate-500">
                  Level {level.order}
                </span>
              </div>
            </div>
            <p className="mt-4 text-slate-600">
              {level.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
        <h2 className="text-lg font-bold text-slate-900">
          IELTS / TOEFL preparation
        </h2>
        <p className="mt-2 text-slate-600">
          When available, we offer preparation courses for IELTS and TOEFL to
          support students planning to study or work abroad.
        </p>
      </div>

      <div className="mt-10">
        <Link
          href="/register"
          className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
        >
          Register for a course →
        </Link>
      </div>
    </div>
  );
}
