import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  function handleChange(e) {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  }

  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);

    setMessage("");

    setTimeout(() => {

      setLoading(false);

      if (isLogin) {

        setMessage("✅ Login successful. Redirecting...");

        setTimeout(() => {

          navigate("/dashboard");

        }, 1200);

      } else {

        setMessage("✅ Account created successfully.");

      }

    }, 1800);

  }

  return (

    <div className="min-h-screen bg-[#03131c] text-white flex items-center justify-center relative overflow-hidden px-6 py-12">

      {/* GRID */}

      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#0f2f3d_1px,transparent_1px),linear-gradient(90deg,#0f2f3d_1px,transparent_1px)] bg-[size:60px_60px]"></div>


      {/* GLOW */}

      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-cyan-500/20 blur-[170px] rounded-full"></div>


      {/* MAIN */}

      <div className="relative z-10 w-full max-w-[760px]">

        {/* HEADER */}

        <div className="text-center mb-16 px-4">

          <div className="text-cyan-400 text-7xl mb-6">
            🔥
          </div>

          <h1 className="text-[75px] font-bold bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">

            ThermaPredict

          </h1>

          <p className="text-gray-400 mt-8 text-[24px] leading-[1.8] max-w-[700px] mx-auto text-center px-4">

            AI-powered predictive maintenance platform for
            enterprise industrial monitoring systems.

          </p>

        </div>


        {/* CARD */}

        <div className="bg-[#071d29]/80 backdrop-blur-2xl mb-10 border border-cyan-900/70 rounded-[42px] px-14 py-14 shadow-[0_10px_60px_rgba(6,182,212,0.15)]">

          {/* TABS */}

          <div className="flex bg-[#03131c] rounded-[26px] p-3 mb-12 gap-3">

            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-[22px] py-6 text-[24px] font-bold transition-all duration-300 min-h-[82px]

              ${isLogin
                ? "bg-cyan-400 text-black shadow-lg"
                : "text-gray-400 hover:text-white"
              }`}
            >

              Sign in

            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-[22px] py-6 text-[24px] font-bold transition-all duration-300 min-h-[82px]

              ${!isLogin
                ? "bg-cyan-400 text-black shadow-lg"
                : "text-gray-400 hover:text-white"
              }`}
            >

              Sign up

            </button>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-10"
          >

            {/* NAME */}

            {!isLogin && (

              <div>

                <label className="block text-[22px] font-semibold text-gray-200 mb-4">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-8 py-6 text-[22px] outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-[84px]"
                />

              </div>

            )}


            {/* EMAIL */}

            <div>

              <label className="block text-[22px] font-semibold text-gray-200 mb-4 mt-4">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-8 py-6 text-[22px] outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-[84px]"
              />

            </div>


            {/* PASSWORD */}

            <div>

              <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">

                <label className="text-[22px] font-semibold text-gray-200">
                  Password
                </label>

                {isLogin && (

                  <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 transition text-[18px]"
                  >

                    Forgot Password?

                  </button>

                )}

              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-[#03131c] border border-cyan-900 rounded-[24px] px-8 py-6 text-[22px] outline-none transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 min-h-[84px]"
              />

            </div>


            {/* MESSAGE */}

            {message && (

              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[24px] px-8 py-6 text-cyan-300 text-[20px]">

                {message}

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 text-black font-black py-7 rounded-[26px] hover:bg-cyan-300 transition-all duration-300 text-[26px] shadow-[0_10px_30px_rgba(34,211,238,0.25)] disabled:opacity-60 mt-2 min-h-[88px]"
            >

              {loading
                ? "Processing..."
                : isLogin
                ? "Sign in"
                : "Create Account"}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="flex items-center gap-6 my-12">

            <div className="flex-1 h-[1px] bg-gray-700"></div>

            <p className="text-gray-400 text-sm tracking-[0.35em] whitespace-nowrap">
              OR CONTINUE WITH
            </p>

            <div className="flex-1 h-[1px] bg-gray-700"></div>

          </div>


          {/* GOOGLE */}

          <button className="w-full bg-black border border-cyan-900 rounded-[26px] py-7 hover:bg-[#0b2432] transition-all duration-300 text-[24px] font-semibold flex items-center justify-center gap-5 min-h-[88px]">

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-8 h-8"
            />

            Continue with Google

          </button>

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