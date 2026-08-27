import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../../api/axiosInstance";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const [animate, setAnimate] = useState(false);
  const prefill = location.state?.prefill || {};

  const isPrefilled = !!prefill.email;

  const [form, setForm] = useState({
    firstName: prefill.firstName || "",
    lastName: prefill.lastName || "",
    email: prefill.email || "",
    phoneNumber: prefill.phoneNumber || "",
    password: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    window.requestAnimationFrame(() => setAnimate(true));
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/signup", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        role: "applicant",
      });

      const { accessToken, refreshToken, role } = response.data;

      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", role);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      setSuccess("Account created successfully. Redirecting to dashboard...");

      timeoutRef.current = setTimeout(() => {
        const destination = role === "admin" ? "/admin" : "/applicant";

        navigate(destination, {
          state: { from: location.state?.from },
        });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Signup failed. Please try again.",
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

          <h2>{isPrefilled ? "Create your password" : "Create account"}</h2>
          {isPrefilled && (
            <p className="prefill-notice">
              Your application details have been locked in. Choose a secure
              password to complete your account registration.
            </p>
          )}

          <div className="name-row">
            <div className="field">
              <label htmlFor="firstName"></label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                readOnly={isPrefilled}
                className={isPrefilled ? "input-locked" : ""}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="lastName"></label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                readOnly={isPrefilled}
                className={isPrefilled ? "input-locked" : ""}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email"></label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              readOnly={isPrefilled}
              className={isPrefilled ? "input-locked" : ""}
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
              autoFocus={isPrefilled}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z\d]).{8,}"
              title="Must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
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

          <div className="field">
            <label htmlFor="phoneNumber"></label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              maxLength="10"
              placeholder="Phone number"
              value={form.phoneNumber}
              onChange={handleChange}
              readOnly={isPrefilled}
              className={isPrefilled ? "input-locked" : ""}
              required
            />
          </div>

          <div className="field terms">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the <a href="#terms">terms and conditions</a>.
              </span>
            </label>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading
              ? "Creating account..."
              : isPrefilled
                ? "Complete Registration"
                : "Create account"}
          </button>
          <p className="signin-link">
            Already have an account? <Link to="/signin">Log in</Link>
          </p>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      </main>
    </div>
  );
};

export default SignUp;
