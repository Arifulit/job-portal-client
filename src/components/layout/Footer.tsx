// এই ফাইলটি app layout (navbar/sidebar/footer/outlet) structure নিয়ন্ত্রণ করে।
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const candidateLinks = [
    { label: "Browse Jobs", to: "/jobs" },
    { label: "Create Candidate Account", to: "/register/candidate" },
    { label: "My Applications", to: "/candidate/applications" },
  ];

  const recruiterLinks = [
    { label: "Recruiter Registration", to: "/register/recruiter" },
    { label: "Recruiter Login", to: "/login" },
    { label: "Post a Job", to: "/recruiter/jobs/create" },
  ];

  const companyLinks = [
    { label: "About", to: "/about" },
    { label: "Features", to: "/features" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
  ];

  const linkClass = "text-sm text-slate-300 transition-colors hover:text-white";

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-slate-700/70 bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.1),transparent_38%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-7 pt-12 sm:px-6 lg:px-8 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="text-center lg:col-span-5 lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              Job Portal
            </Link>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              A modern hiring platform where candidates discover opportunities and recruiters build strong teams with confidence.
            </p>
            <div className="mt-5 inline-flex items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              Trusted Workflow • Role-Based Access
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 sm:text-left lg:col-span-7 lg:grid-cols-3">
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Candidates</h4>
              <ul className="space-y-2">
                {candidateLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={linkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Recruiters</h4>
              <ul className="space-y-2">
                {recruiterLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={linkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-200">Company</h4>
              <ul className="space-y-2">
                {companyLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={linkClass}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-center text-sm text-slate-400 md:flex-row md:text-left">
          <p>&copy; {new Date().getFullYear()} Job Portal. All rights reserved.</p>
          <p>Built with React, TypeScript, Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;