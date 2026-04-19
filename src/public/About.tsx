// এই ফাইলটি public facing informational page বা section render করে।
import React from "react";
import { Briefcase, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";

const highlights = [
  {
    title: "Role-Based Experience",
    desc: "Admins, recruiters, and candidates each get focused dashboards and workflows.",
    icon: Users,
  },
  {
    title: "AI-Powered Matching",
    desc: "Recommendations surface relevant jobs and candidates faster with better signal.",
    icon: Sparkles,
  },
  {
    title: "Secure Platform",
    desc: "Protected routes, robust auth, and policy-aware access across every module.",
    icon: ShieldCheck,
  },
];

const stack = ["React", "TypeScript", "React Router", "TanStack Query", "Tailwind CSS", "Vite"];

const principles = [
  {
    title: "Clarity First",
    desc: "Simple interfaces and role-specific actions reduce friction from day one.",
  },
  {
    title: "Reliable Operations",
    desc: "Secure flows and predictable data handling keep hiring pipelines stable.",
  },
  {
    title: "Scalable Foundation",
    desc: "Modular architecture allows rapid feature growth without product complexity.",
  },
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f6f9ff_0%,_#eef4ff_55%,_#f8fbff_100%)] py-12 dark:bg-[radial-gradient(circle_at_0%_0%,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative bg-gradient-to-br from-[#0f2f57] via-[#164e88] to-[#224f85] p-8 text-white md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(147,197,253,0.24),_transparent_36%)]" />
              <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                <Briefcase className="h-4 w-4" />
                About Our Platform
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Professional Hiring Infrastructure For Modern Teams
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                The AI Job Portal streamlines hiring from discovery to application tracking. It is built for clarity,
                speed, and role-aware workflows so recruiters and candidates can move without friction.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="mt-1 text-sm text-slate-200">Workflow availability</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold">3</p>
                  <p className="mt-1 text-sm text-slate-200">Role dashboards</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold">10+</p>
                  <p className="mt-1 text-sm text-slate-200">Core modules</p>
                </div>
              </div>
              </div>
            </div>

            <div className="bg-slate-50/70 p-8 dark:bg-slate-950/40 md:p-12">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">What this platform does</h2>
              <div className="mt-5 space-y-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-[1fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              <Workflow className="h-6 w-6 text-blue-700 dark:text-blue-400" />
              Technology Foundation
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              Built with React, TypeScript, React Router, TanStack Query, Tailwind CSS, and Vite. The architecture is
              API-first and works cleanly with REST or GraphQL backends.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Our Core Principles</h2>
            <div className="mt-4 space-y-3">
              {principles.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
