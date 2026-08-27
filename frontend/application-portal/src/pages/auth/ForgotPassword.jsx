import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axiosInstance";
import "./SignUp.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/forgot-password", { email });
      setSuccess(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-screen">
      <div className="logo" />
      <aside className="visual-panel" />
      <main className="form-panel">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Forgot password</h2>
          <p className="signin-link">
            Remembered it? <Link to="/signin">Log in</Link>
          </p>

          <div className="field">
            <label htmlFor="email"></label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      </main>
    </div>
  );
};

export default ForgotPassword;
