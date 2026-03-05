import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient px-4 py-32 sm:px-6 lg:py-40">
        <div className="mx-auto max-w-4xl text-center hero-content">
          <p className="animate-fade-in-up text-sm font-bold uppercase tracking-[0.2em] text-slate-600">
            English in Cotonou
          </p>
          <h1 className="mt-6 animate-fade-in-up text-5xl font-extrabold tracking-tight text-slate-900 animate-delay-100 sm:text-6xl lg:text-7xl">
            Master English at{""}
            <span className="text-gradient">Cedar</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg font-medium leading-relaxed text-slate-700 animate-delay-200 sm:text-xl">
            Accelerate your career and open global opportunities with structured, professional English programs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-300">
            <Link
              href="/register"
              className="group w-full sm:w-auto text-center relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-emerald-500/40"
            >
              <span className="relative z-10">Start your journey</span>
              <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[30deg] transition-transform duration-700 group-hover:translate-x-[150%]"></div>
            </Link>
            <Link
              href="/courses"
              className="glass-panel w-full sm:w-auto text-center rounded-xl px-8 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50/50 hover:text-emerald-700"
            >
              View programs &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 pb-20 sm:px-6 animate-fade-in-up animate-delay-400">
        <div className="grid gap-8 sm:grid-cols-2 lg:gap-8">
          <Link
            href="/about"
            className="group glass-panel card-hover rounded-2xl p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900 group-hover:text-emerald-600:text-emerald-400 transition-colors">
              Why Cedar?
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Structured programs tailored for individuals and professionals. We offer carefully graded levels from Beginner to Advanced, plus dedicated exam preparation.
            </p>
            <span className="mt-6 flex items-center font-semibold text-emerald-600 group-hover:gap-2 transition-all">
              Discover our story <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
            </span>
          </Link>

          <Link
            href="/courses"
            className="group glass-panel card-hover rounded-2xl p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900 group-hover:text-teal-600:text-teal-400 transition-colors">
              Our Campus
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Located in the heart of Cotonou. Equipped with modern facilities, interactive learning materials, and an environment designed to make you speak.
            </p>
            <span className="mt-6 flex items-center font-semibold text-teal-600 group-hover:gap-2 transition-all">
              View Location <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
