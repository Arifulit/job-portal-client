import React, { useState } from "react";
import { Clock3, Mail, MapPin, MessageSquareText, PhoneCall } from "lucide-react";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-sm md:p-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Contact Our Team</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            Have a question about hiring workflows, candidate experience, or integrations? Send a message and
            our team will get back to you with the right support.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Support Information</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-700" />
                  support@jobportal.ai
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-4 w-4 text-blue-700" />
                  +880 1712 345 678
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-blue-700" />
                  Dhaka, Bangladesh
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-blue-700" />
                  Sat - Thu, 10:00 AM - 6:00 PM
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 shadow-sm">
              <p className="font-semibold">Typical response time</p>
              <p className="mt-1">Within 24 hours on working days.</p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <MessageSquareText className="h-6 w-6 text-blue-700" />
              Send A Message
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    aria-label="Name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  aria-label="Subject"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  className="min-h-[140px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  aria-label="Message"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {status === "success" && (
                  <p className="text-sm font-medium text-emerald-700">Message sent successfully.</p>
                )}
                {status === "error" && (
                  <p className="text-sm font-medium text-red-600">
                    Please fill required fields and provide a valid email.
                  </p>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;