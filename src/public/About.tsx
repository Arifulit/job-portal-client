import React from "react";

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">About the AI Job Portal</h1>

      <p className="mb-4 text-base text-muted-foreground">
        This project is an AI-assisted job portal built to streamline job matching between
        recruiters and candidates. It provides role-based dashboards, profile management,
        and intelligent features to improve hiring and job search workflows.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Key features</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Role-based dashboards for admins, recruiters, and Candidates</li>
          <li>Smart job matching / recommendations</li>
          <li>Profile & resume management</li>
          <li>Notifications and real-time updates</li>
          <li>Secure authentication and authorization</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Tech stack</h2>
        <p className="text-sm text-muted-foreground">
          React + TypeScript, React Router, TanStack Query, Tailwind CSS, Vite. Backend
          can be integrated via REST or GraphQL APIs for data and AI services.
        </p>
      </section>
    </div>
  );
};

export default About;
