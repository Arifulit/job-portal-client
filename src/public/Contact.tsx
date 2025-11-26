import React, { useState } from "react";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      return;
    }
    if (!validateEmail(email)) {
      setStatus("error");
      return;
    }

    setLoading(true);
    // Simulate submit (replace with real API call)
    setTimeout(() => {
      setLoading(false);
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Have questions about the AI Job Portal or want to integrate AI services?
        Send us a message and we'll get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            aria-label="Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email"
            type="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional)"
            aria-label="Subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            aria-label="Message"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <p className="text-sm text-green-600">Message sent successfully.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">
              Please fill required fields and provide a valid email.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Contact;