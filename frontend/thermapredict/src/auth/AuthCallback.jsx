import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const exchange = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    exchange.current ??= code && supabase
      ? supabase.auth.exchangeCodeForSession(code)
      : Promise.reject(new Error("Missing authorization code"));

    exchange.current.then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) throw new Error("Could not verify the email link");
      navigate(data.redirectType === "recovery" ? "/reset-password" : "/", { replace: true });
    }).catch(() => {
      if (!active) return;
      window.history.replaceState(window.history.state, "", window.location.pathname);
      setFailed(true);
    });

    return () => { active = false; };
  }, [navigate]);

  return (
    <main className="grid min-h-dvh place-content-center gap-4 bg-[#03131c] p-6 text-center text-white">
      <p role={failed ? "alert" : "status"}>
        {failed ? "This link is invalid or expired. Request a fresh link and open it in the same browser." : "Verifying your email link..."}
      </p>
      {failed && <Link className="text-cyan-400 underline" to="/forgot-password">Request a password reset</Link>}
      {failed && <Link className="text-cyan-400 underline" to="/">Back to sign in</Link>}
    </main>
  );
}
