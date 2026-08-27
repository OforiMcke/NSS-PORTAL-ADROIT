import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axiosInstance";
import "./SignUp.css";
import "./ForgotPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div>
      <div className="logo" />
      <main className="form-panel-1">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="fgt-pass">Reset password</h2>
          <p className="signin-link">
            <Link to="/signin">Back to log in</Link>
          </p>

          <div className="field">
            <label htmlFor="password"></label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z\d]).{8,}"
              title="Must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-1"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword"></label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-1"
              onClick={() => setShowConfirmPassword((s) => !s)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
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
