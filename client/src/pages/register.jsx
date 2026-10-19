import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    targetRole: "Frontend Engineer",
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await register(formData.fullName, formData.email, formData.password);
      setMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setMessage(error.message || "Registration failed");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <Card hoverable={false} className="animate-fade-in">
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: "0 auto 1rem", width: "48px", height: "48px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h1>Create Account</h1>
            <p>Start practicing mock interviews with personalized AI coaching</p>
          </div>

          {message && (
            <div
              className={`alert-banner ${
                message.includes("ready") || message.includes("success")
                  ? "alert-success"
                  : "alert-error"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                name="fullName"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="developer@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                Primary Target Role
              </label>
              <select
                id="reg-role"
                name="targetRole"
                className="form-select"
                value={formData.targetRole}
                onChange={handleChange}
              >
                <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
                <option value="Backend Engineer">Backend Engineer (Node / Python / Go)</option>
                <option value="Full-Stack Engineer">Full-Stack Developer</option>
                <option value="System Architect">System Architect</option>
                <option value="DevOps / Cloud">DevOps & Cloud Engineer</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="reg-pass">Password</label>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.8rem", cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="reg-pass"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "1rem 0" }}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                style={{ accentColor: "var(--accent-primary)", cursor: "pointer" }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                I agree to the terms of practice and community guidelines
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn-full"
              loading={loading}
            >
              {loading ? "Creating Account..." : "Create Free Account"}
            </Button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default Register;