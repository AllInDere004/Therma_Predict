import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../supabase";

function Login({ mode = "account" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, initializing, recovering, completeRecovery } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: location.state?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [updated, setUpdated] = useState(false);
  const isAccount = mode === "account";
  const isRequest = mode === "request";
  const isUpdate = mode === "update";
  const needsNewPassword = isUpdate || (isAccount && !isLogin);
  const canUpdate = Boolean(session && recovering);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function switchMode(signIn) {
    setIsLogin(signIn);
    setFormData({ ...formData, password: "" });
    setMessage("");
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase || loading || (isUpdate && !canUpdate)) return;

    setMessage("");
    setFormError("");
    const email = formData.email.trim();
    const name = formData.name.trim();
    const password = formData.password;
    if (isAccount && !isLogin && !name) {
      setFormError("Enter your full name.");
      return;
    }
    if (needsNewPassword && password.length < 8) {
      setFormError("Use at least 8 characters for your password.");
      return;
    }
    if (isUpdate && password !== formData.confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const redirectTo = window.location.origin + "/auth/callback";
    try {
      if (isRequest) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setMessage("If an account exists for this email, you will receive a reset link. Open it in this browser.");
      } else if (isUpdate) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        completeRecovery();
        setUpdated(true);
        setMessage("Password updated successfully.");
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: redirectTo, data: { full_name: name } },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Check your inbox for a confirmation email. Open the link in this browser to finish signing up.");
        }
      }
      setFormData((current) => ({ ...current, password: "", confirmPassword: "" }));
    } catch (error) {
      if (error.code === "email_not_confirmed") {
        setFormError("Confirm your email address before signing in.");
      } else if (error.code === "invalid_credentials") {
        setFormError("The email or password is incorrect.");
      } else if (error.code === "weak_password") {
        setFormError("Choose a stronger password that meets the account password policy.");
      } else if (error.status === 429) {
        setFormError("Too many attempts. Wait a moment and try again.");
      } else {
        setFormError(isRequest ? "Could not request a reset link. Try again."
          : isUpdate ? "Could not update your password. Try again or request a new link."
          : isLogin ? "Could not sign in. Try again." : "Could not create your account. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function cancelRecovery() {
    setLoading(true);
    setFormError("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      navigate("/", { replace: true });
    } catch {
      setFormError("Could not sign out. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isAccount && !initializing && session) {
    return <Navigate to={recovering ? "/reset-password" : "/dashboard"} replace />;
  }

  return (

    <div className="relative isolate flex min-h-dvh items-center justify-center bg-[#03131c] px-4 py-3 sm:py-4 text-white sm:px-6 sm:py-10">

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#0f2f3d_1px,transparent_1px),linear-gradient(90deg,#0f2f3d_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-cyan-500/20 blur-[170px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[760px]">

        {/* HEADER */}

        <div className="text-center mb-6 sm:mb-10 px-4">

          <div className="text-cyan-400 text-5xl sm:text-6xl mb-6">
            🔥
          </div>

          <h1 className="text-[clamp(2rem,9vw,4.6875rem)] leading-tight font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">

            ThermaPredict

          </h1>

          <p className="text-gray-400 mt-8 text-base leading-relaxed sm:text-xl max-w-[700px] mx-auto text-center px-4">

            AI-powered predictive maintenance platform for
            enterprise industrial monitoring systems.

          </p>

        </div>


        {/* CARD */}

        <div className="bg-[#071d29]/80 backdrop-blur-2xl mb-10 border border-cyan-900/70 rounded-[42px] p-4 sm:p-8 lg:p-12 shadow-[0_10px_60px_rgba(6,182,212,0.15)]">

          {/* TABS */}

          {isAccount ? <div className="flex bg-[#03131c] rounded-[26px] p-3 mb-5 sm:mb-8 gap-3">

            <button
              type="button"
              disabled={loading}
              aria-pressed={isLogin}
              onClick={() => switchMode(true)}
              className={`flex-1 rounded-[22px] py-3 sm:py-4 text-base sm:text-xl font-bold transition-all duration-300 min-h-11

              ${isLogin
                ? "bg-cyan-400 text-black shadow-lg"
                : "text-gray-400 hover:text-white"
              }`}
            >

              Sign in

            </button>

            <button
              type="button"
              disabled={loading}
              aria-pressed={!isLogin}
              onClick={() => switchMode(false)}
              className={`flex-1 rounded-[22px] py-3 sm:py-4 text-base sm:text-xl font-bold transition-all duration-300 min-h-11

              ${!isLogin
                ? "bg-cyan-400 text-black shadow-lg"
                : "text-gray-400 hover:text-white"
              }`}
            >

              Sign up

            </button>

          </div> : (
            <h2 className="mb-5 text-xl font-bold sm:text-2xl">
              {isRequest ? "Reset your password" : "Choose a new password"}
            </h2>
          )}

          {!supabase && <p role="alert" className="mb-4 text-cyan-300">Authentication is not configured.</p>}
          {isUpdate && !initializing && !canUpdate && !updated && (
            <p role="alert" className="mb-4 text-cyan-300">Open a valid password reset link to continue.</p>
          )}

          {/* FORM */}

          {(!isUpdate || canUpdate) && !updated && <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-6"
          >

            {/* NAME */}

            {isAccount && !isLogin && (

              <div>

                <label htmlFor="auth-name" className="block text-base sm:text-lg font-semibold text-gray-200 mb-4">
                  Full Name
                </label>

                <input
                  type="text"
                  id="auth-name"
                  name="name"
                  required autoComplete="name" maxLength={120}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-3 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-12"
                />

              </div>

            )}


            {/* EMAIL */}

            {!isUpdate && <div>

              <label htmlFor="auth-email" className="block text-base sm:text-lg font-semibold text-gray-200 mb-4 mt-4">
                Email Address
              </label>

              <input
                type="email"
                id="auth-email"
                name="email"
                required autoComplete="email" maxLength={254}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-3 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-12"
              />

            </div>}


            {/* PASSWORD */}

            {!isRequest && <div>

              <label htmlFor="auth-password" className="mb-4 block text-base font-semibold text-gray-200 sm:text-lg">
                Password
              </label>

              <input
                type="password"
                id="auth-password"
                name="password"
                required autoComplete={needsNewPassword ? "new-password" : "current-password"} minLength={needsNewPassword ? 8 : undefined}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-3 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-12"
              />

              {isAccount && isLogin && (
                <div className="mt-1 flex justify-end">
                  <Link
                    to="/forgot-password"
                    state={{ email: formData.email.trim() }}
                    aria-disabled={loading || undefined}
                    onClick={(event) => {
                      if (loading) event.preventDefault();
                    }}
                    className="inline-flex min-h-11 items-center rounded-lg text-base font-semibold text-cyan-400 underline underline-offset-4 transition-colors hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 aria-disabled:opacity-60"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

            </div>}

            {isUpdate && (
              <div>
                <label htmlFor="auth-confirm" className="mb-4 block font-semibold text-gray-200">Confirm password</label>
                <input
                  id="auth-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="min-h-12 w-full rounded-[24px] border border-cyan-900 bg-[#03131c] px-3 py-3 outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 sm:px-5"
                />
              </div>
            )}
            {formError && <p role="alert" className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">{formError}</p>}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading || initializing || !supabase}
              className="w-full bg-cyan-400 text-black font-black py-3 sm:py-4 rounded-[26px] hover:bg-cyan-300 transition-all duration-300 text-lg sm:text-xl shadow-[0_10px_30px_rgba(34,211,238,0.25)] disabled:opacity-60 mt-2 min-h-12"
            >

              {loading ? (isRequest ? "Sending reset link..." : "Processing...") : isRequest ? "Send reset link"
                : isUpdate ? "Update password" : isLogin ? "Sign in" : "Create Account"}

            </button>

          </form>}
          {message && <p role="status" className="mt-4 rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">{message}</p>}
          {isUpdate && canUpdate && !updated && (
            <button
              type="button"
              disabled={loading}
              onClick={cancelRecovery}
              className="mt-4 text-cyan-400 underline disabled:opacity-60"
            >
              Cancel reset and sign out
            </button>
          )}
          {!isAccount && (!canUpdate || !isUpdate || updated) && (
            <Link className="mt-4 inline-block text-cyan-400 underline" to={
              updated ? "/dashboard" : isUpdate && !canUpdate ? "/forgot-password" : "/"
            }>
              {updated ? "Continue to dashboard" : isUpdate && !canUpdate ? "Request a new link" : "Back to sign in"}
            </Link>
          )}


          {isAccount && <>
          {/* DIVIDER */}

          <div className="flex items-center gap-6 my-5 sm:my-8">

            <div className="flex-1 h-[1px] bg-gray-700"></div>

            <p className="text-gray-400 text-sm text-center tracking-widest">
              OR CONTINUE WITH
            </p>

            <div className="flex-1 h-[1px] bg-gray-700"></div>

          </div>


          {/* GOOGLE */}

          <button type="button" disabled title="Google sign-in is unavailable" className="w-full bg-black border border-cyan-900 rounded-[26px] py-3 sm:py-4 hover:bg-[#0b2432] transition-all duration-300 text-base sm:text-xl font-semibold flex items-center justify-center gap-5 min-h-12">

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-8 h-8"
            />

            Continue with Google

          </button>
          </>}

        </div>


        {/* FOOTER */}

        <p className="text-center text-gray-500 text-[16px] mt-10 leading-relaxed px-6">

          By continuing, you agree to our
          Terms of Service and Privacy Policy.

        </p>

      </div>

    </div>

  );
}

export default Login;