import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./SignUp.css";
import { api } from "../../api/axiosInstance";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animate, setAnimate] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.requestAnimationFrame(() => setAnimate(true));

    const currentRole = localStorage.getItem("userRole");
    if (currentRole === "admin") {
      navigate("/admin");
    } else if (currentRole === "applicant") {
      navigate("/applicant");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/signin", {
        email: form.email,
        password: form.password,
      });

      const displayName =
        data.role === "admin"
          ? "Recruiter"
          : `${data.firstName} ${data.lastName}`;

      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", displayName);
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

      const from = location.state?.from?.pathname;
      const fallback = data.role === "admin" ? "/admin" : "/applicant";
      const destination = from && from !== "/signin" ? from : fallback;

      setSuccess(
        data.role === "admin"
          ? "Signed in as recruiter. Redirecting..."
          : "Signed in successfully. Redirecting...",
      );

      setTimeout(() => navigate(destination, { replace: true }), 900);
      console.log("Signin success:", data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Signin failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`split-screen ${animate ? "page-enter" : ""}`}>
      <div className="logo" />
      <aside className="visual-panel" />
      <main className="form-panel">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h3 className="wlcm-me">Welcome to Adroit360 Application Portal</h3>
          <h2>Sign in</h2>

          <div className="field">
            <label htmlFor="email"></label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password"></label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 1l22 22" />
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.64 18.64 0 0 1 5.06-5.94" />
                  <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                  <path d="M14.12 9.88A3 3 0 0 0 9.88 14.12" />
                  <path d="M22.94 12.94A18.64 18.64 0 0 0 17.94 6.06" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="signin-link">
            Don&apos;t have an account? <Link to="/signup">Create account</Link>
          </p>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      </main>
    </div>
  );
};

export default SignIn;
