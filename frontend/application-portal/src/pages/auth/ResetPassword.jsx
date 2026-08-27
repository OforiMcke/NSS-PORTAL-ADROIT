import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axiosInstance";
import "./SignUp.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/api/auth/reset-password/${token}`, {
        password,
      });
      setSuccess(data.message);
      setTimeout(() => navigate("/signin"), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "This reset link is invalid or has expired.",
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
          <h2>Reset password</h2>
          <p className="signin-link">
            <Link to="/signin">Back to log in</Link>
          </p>

          <div className="field">
            <label htmlFor="password"></label>
            <input
              id="password"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword"></label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;
