


/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/GoogleSuccess.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const GoogleSuccess = () => {
  const { setUserFromToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    const token =
      params.get("accessToken") ||
      params.get("token") ||
      params.get("access_token") ||
      hashParams.get("accessToken") ||
      hashParams.get("token") ||
      hashParams.get("access_token");

    const refreshToken =
      params.get("refreshToken") ||
      params.get("refresh_token") ||
      hashParams.get("refreshToken") ||
      hashParams.get("refresh_token");

    const redirectParam = params.get("redirect") || hashParams.get("redirect");

    if (!token) {
      toast.error("Google login failed. No token found.");
      navigate("/login?error=google_failed");
      return;
    }

    (async () => {
      try {
        // setUserFromToken এর ভেতরেই cookie + localStorage সব save হয়।
        // এখানে আলাদা Cookies.set() করার দরকার নেই — duplicate এড়াতে।
        await setUserFromToken(token, refreshToken ?? undefined);

        try {
          const toastKey = "google_login_toast_shown";
          if (!sessionStorage.getItem(toastKey)) {
            toast.success("Google login successful! Welcome.");
            sessionStorage.setItem(toastKey, "true");
          }
        } catch {
          toast.success("Google login successful! Welcome.");
        }

        // URL থেকে token সরিয়ে দাও
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("accessToken");
          url.searchParams.delete("token");
          url.searchParams.delete("access_token");
          url.searchParams.delete("refreshToken");
          url.searchParams.delete("refresh_token");
          url.hash = "";
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch {
          // ignore
        }

        // redirect নির্ধারণ
        let destination = "/";
        if (redirectParam) {
          destination = redirectParam;
        } else {
          try {
            const raw = localStorage.getItem("user");
            const stored = raw ? JSON.parse(raw) : null;
            const role = (stored?.role || "candidate").toLowerCase();
            if (role === "admin") destination = "/admin/dashboard";
            else if (role === "recruiter") destination = "/recruiter/dashboard";
            else destination = "/";
          } catch {
            destination = "/";
          }
        }

        navigate(destination, { replace: true });
      } catch (err: any) {
        toast.error("Google login failed: " + (err?.message || "Invalid token"));
        navigate("/login?error=token_invalid");
      }
    })();
  }, [navigate, setUserFromToken]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#0E5EA8] border-t-transparent" />
        <p className="text-slate-500">Signing you in...</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;