import React from "react";

const features = [
  {
    title: "Role-based Dashboards",
    desc: "Dedicated dashboards for admins, recruiters, and Candidates with role-specific tools and permissions.",
  },
  {
    title: "AI-powered Matching",
    desc: "Smart job and candidate recommendations using resume and job-description analysis.",
  },
  {
    title: "Profile & Resume Management",
    desc: "Rich profile editor and resume uploads with sections for skills, experience, and education.",
  },
  {
    title: "Job Posting & Applications",
    desc: "Create, manage, and track job postings and incoming applications with easy workflows.",
  },
  {
    title: "Notifications & Real-time Updates",
    desc: "In-app notifications and status updates for applications, interviews, and messages.",
  },
  {
    title: "Secure Auth & Role-based Access",
    desc: "Authentication and authorization with protected routes for sensitive actions.",
  },
];

const Features: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Features</h1>
      <p className="mb-6 text-base text-muted-foreground">
        The AI Job Portal combines modern UX with intelligent features to make hiring and
        job search faster and more relevant.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((f, i) => (
          <div key={i} className="p-4 border rounded-md bg-card">
            <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Integrations & Extensibility</h2>
        <p className="text-sm text-muted-foreground">
          Integrate third-party AI services, analytics, or any backend via REST/GraphQL.
          The frontend is built with React + TypeScript and can be extended to fit your stack.
        </p>
      </section>
    </div>
  );
};

export default Features;