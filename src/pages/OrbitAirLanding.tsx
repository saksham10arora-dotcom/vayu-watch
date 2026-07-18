import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Satellite, LogIn, UserPlus, X, ArrowRight, Loader2 } from "lucide-react";
import Header from "../components/Header";
import { supabase } from "@/lib/supabase";

const OrbitAirLanding: React.FC = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [floatingElements, setFloatingElements] = useState<
    { id: number; x: number; y: number; delay: number; duration: number }[]
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 20 + Math.random() * 10,
    }));
    setFloatingElements(elements);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home");
    });
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (authMode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name } },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate("/home");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (showAuth) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
          {floatingElements.map((el) => (
            <div
              key={el.id}
              className="absolute w-1 h-1 bg-neutral-600 rounded-full opacity-10"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                animation: `float ${el.duration}s ease-in-out ${el.delay}s infinite`,
              }}
            />
          ))}

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(-15px) translateX(10px); }
            }
          `}</style>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => { setShowAuth(false); setError(null); setMessage(null); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center justify-center mb-8">
              <Satellite className="text-neutral-400 mr-3" size={32} />
              <h2 className="text-3xl font-bold text-neutral-100">OrbitAir</h2>
            </div>

            <button
              onClick={() => { setShowAuth(false); setError(null); setMessage(null); }}
              className="w-full mb-6 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 border border-neutral-700"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Site
            </button>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => { setAuthMode("login"); setError(null); setMessage(null); }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  authMode === "login"
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setError(null); setMessage(null); }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  authMode === "signup"
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4" onKeyDown={handleKeyDown}>
              {authMode === "signup" && (
                <div>
                  <label className="block text-neutral-300 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-neutral-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-neutral-300 text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {authMode === "login" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-neutral-400">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-green-400 text-sm bg-green-950/30 border border-green-900 rounded-md px-3 py-2">
                  {message}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-neutral-100 hover:bg-white disabled:opacity-50 text-neutral-900 font-semibold py-3 px-6 rounded-md transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : authMode === "login" ? (
                  <><LogIn size={20} /> Login</>
                ) : (
                  <><UserPlus size={20} /> Sign Up</>
                )}
              </button>
            </div>

            <p className="text-center text-neutral-500 text-sm mt-6">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setAuthMode("signup")} className="text-neutral-300 hover:text-neutral-100 font-semibold">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("login")} className="text-neutral-300 hover:text-neutral-100 font-semibold">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute w-1 h-1 bg-neutral-600 rounded-full opacity-10"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              animation: `float ${el.duration}s ease-in-out ${el.delay}s infinite`,
            }}
          />
        ))}

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-15px) translateX(10px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(4px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(4px) rotate(-360deg); }
          }
          .fade-in-up { animation: fadeInUp 1s ease-out forwards; }
          .fade-in-up-delay-1 { opacity: 0; animation: fadeInUp 1s ease-out 0.3s forwards; }
          .fade-in-up-delay-2 { opacity: 0; animation: fadeInUp 1s ease-out 0.6s forwards; }
        `}</style>

        <div className="text-center z-10 px-4">
          <div className="flex items-center justify-center mb-8 fade-in-up">
            <div className="relative mr-4">
              <Satellite className="text-neutral-300" size={56} style={{ animation: "orbit 30s linear infinite" }} />
            </div>
            <h1 className="text-8xl font-light text-neutral-100 tracking-tight">OrbitAir</h1>
          </div>

          <p className="text-xl text-neutral-400 mb-3 fade-in-up-delay-1 font-light">
            Real-time Air Quality Monitoring
          </p>
          <p className="text-base text-neutral-500 mb-12 max-w-xl mx-auto fade-in-up-delay-1 font-light">
            Track air quality data from cities worldwide. Stay informed, breathe better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up-delay-2">
            <button
              className="group bg-neutral-100 hover:bg-white text-neutral-900 font-medium py-4 px-8 rounded-md transition-all transform hover:scale-[1.02] flex items-center gap-3"
              onClick={() => navigate("/home")}
            >
              Enter Site
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowAuth(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-100 font-medium py-4 px-8 rounded-md transition-all transform hover:scale-[1.02] border border-neutral-800 flex items-center gap-3"
            >
              <LogIn size={20} />
              Login / Sign Up
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-12 fade-in-up-delay-2">
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-sm font-light">Live Data</span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-sm font-light">Global Coverage</span>
            <span className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-sm font-light">Real-time Alerts</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent"></div>
      </div>
    </>
  );
};

export default OrbitAirLanding;
