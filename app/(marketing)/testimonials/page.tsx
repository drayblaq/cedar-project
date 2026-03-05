export const metadata = {
  title:"Testimonials | Cedar Training Center",
  description:"What students and parents say about Cedar Training Center in Cotonou, Benin.",
};

const TESTIMONIALS = [
  {
    quote:"The structure and support at Cedar helped me move from beginner to intermediate in one year. I now feel confident using English at work.",
    author:"Student",
    role:"Former Beginner level",
  },
  {
    quote:"My child's progress has been clear and well explained. The teachers are patient and the environment is serious about learning.",
    author:"Parent",
    role:"Elementary level",
  },
  {
    quote:"I came for IELTS preparation and got the score I needed. The course was well organized and the materials were useful.",
    author:"Student",
    role:"IELTS preparation",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
        Voices
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
        Testimonials
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        What students and parents say about Cedar Training Center.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <blockquote
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
          >
            <p className="text-slate-700">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {t.author.charAt(0)}
              </span>
              <div>
                <cite className="not-italic font-semibold text-slate-900">
                  {t.author}
                </cite>
                <span className="block text-sm text-slate-500">{t.role}</span>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
