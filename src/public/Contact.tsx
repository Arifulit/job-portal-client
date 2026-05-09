// এই ফাইলটি public facing informational page বা section render করে।
import React, { useState } from "react";
import { Clock3, Mail, MapPin, MessageSquareText, PhoneCall } from "lucide-react";
import { api, handleApiError } from "../utils/api";
import { toast } from "sonner";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/contact/send", {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (response.data?.success) {
        toast.success("Message sent successfully");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        return;
      }

      toast.error("Failed to send message");
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-6 dark:bg-[radial-gradient(circle_at_0%_0%,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] md:py-7">
      <div className="mx-auto max-w-4xl px-4 sm:px-5">
        <section className="mb-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-[0_14px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 md:p-5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">Contact Our Team</h1>
          <p className="mt-2 max-w-3xl text-[11px] leading-5 text-slate-600 dark:text-slate-300 md:text-xs">
            Have a question about hiring workflows, candidate experience, or integrations? Send a message and
            our team will get back to you with the right support.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 md:text-sm">Support Information</h2>
              <div className="mt-2.5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300 md:text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  ariful.iit@gmail.com
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  +880 1763 584 915
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  Dhaka, Bangladesh
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  Sat - Thu, 10:00 AM - 6:00 PM
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-[11px] text-blue-900 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200 md:text-xs">
              <p className="font-semibold text-xs md:text-sm">Typical response time</p>
              <p className="mt-1">Within 24 hours on working days.</p>
            </div>
          </aside>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100 md:text-lg">
              <MessageSquareText className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              Send A Message
            </h2>

            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-300 md:text-xs">Name</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40 md:text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    aria-label="Name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-300 md:text-xs">Email</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40 md:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-300 md:text-xs">Subject</label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40 md:text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  aria-label="Subject"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-300 md:text-xs">Message</label>
                <textarea
                  className="min-h-[96px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40 md:text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  aria-label="Message"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600 md:text-xs"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;