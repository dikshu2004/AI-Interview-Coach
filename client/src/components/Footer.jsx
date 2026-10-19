import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand-logo-text">
              <span className="brand-title">
                AI <span className="gradient-text">Interview Coach</span>
              </span>
            </div>
            <p className="footer-desc">
              Your personalized AI copilot for mastering technical interviews, behavioral questions, and real-time confidence building.
            </p>
            <div className="footer-status-pill">
              <span className="status-indicator-dot" />
              <span>AI Engine Operational • Ready for Mock Sessions</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/setup">Interview Setup</Link></li>
                <li><Link to="/interview/practice">Live Session</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Domains</h4>
              <ul>
                <li><span className="footer-text-muted">Frontend Engineering</span></li>
                <li><span className="footer-text-muted">Backend & APIs</span></li>
                <li><span className="footer-text-muted">System Design</span></li>
                <li><span className="footer-text-muted">Behavioral (STAR)</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} AI Interview Coach. Built for ambitious developers.</p>
          <div className="footer-badge-clean">
            <span>Powered by Intelligent Feedback</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
