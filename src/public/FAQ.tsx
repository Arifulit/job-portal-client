import React from "react";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is the AI Job Portal?",
    a: "A role-based job portal that uses AI-assisted features to improve job matching, recommendations, and profile management for recruiters and Candidates.",
  },
  {
    q: "Who can use the portal?",
    a: "Admins, recruiters, and Candidates — each role has its own dashboard and permissions.",
  },
  {
    q: "How does AI help with job matching?",
    a: "AI can analyze resumes, job descriptions, and user behavior to surface relevant job recommendations and candidate matches.",
  },
  {
    q: "Is my data secure?",
    a: "Security depends on backend configuration. Use HTTPS, strong authentication, proper authorization checks, and secure storage for sensitive data.",
  },
  {
    q: "How do I get started?",
    a: "Register an account, complete your profile (or company profile for recruiters), and explore the dashboard and job listings.",
  },
  {
    q: "Can I integrate third-party AI services?",
    a: "Yes — the frontend can call REST or GraphQL endpoints that use third-party or custom AI services on the backend.",
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Answers to common questions about the AI Job Portal.
      </p>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="border rounded-md p-4 bg-card"
            aria-labelledby={`faq-${idx}`}
          >
            <summary
              id={`faq-${idx}`}
              className="cursor-pointer list-none font-medium"
            >
              {item.q}
            </summary>
            <div className="mt-2 text-sm text-muted-foreground">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;