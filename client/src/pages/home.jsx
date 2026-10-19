import { Link } from "react-router-dom";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

function Home() {
  const features = [
    {
      title: "Real-Time AI Interviewer",
      desc: "Experience realistic interview scenarios with dynamically tailored questions matching real FAANG & startup rounds.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      ),
      badge: "Intelligent",
    },
    {
      title: "Comprehensive Scorecards",
      desc: "Get instant ratings across technical accuracy, communication clarity, conciseness, and structural delivery.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      badge: "Detailed Metrics",
    },
    {
      title: "Domain & Level Customization",
      desc: "From Junior React Developers to Senior System Architects, tune the interview depth to your exact target tier.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      badge: "Customizable",
    },
    {
      title: "Behavioral STAR Feedback",
      desc: "Master standard behavioral questions using the STAR framework (Situation, Task, Action, Result) with AI critique.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      badge: "Framework",
    },
  ];

  const categories = [
    { title: "Frontend Engineering", roleCount: "React, Vue, TypeScript, Next.js", icon: "⚛️" },
    { title: "Backend Systems", roleCount: "Node.js, Python, Golang, Microservices", icon: "⚙️" },
    { title: "Full-Stack Development", roleCount: "MERN Stack, GraphQL, REST APIs", icon: "💻" },
    { title: "System Design", roleCount: "Scalability, Caching, Databases, Distributed", icon: "📐" },
    { title: "Behavioral & Leadership", roleCount: "Conflict Resolution, Ownership, STAR", icon: "🎯" },
    { title: "DevOps & Cloud", roleCount: "Docker, Kubernetes, AWS, CI/CD Pipelines", icon: "☁️" },
  ];

  return (
    <div className="home-page-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <span className="hero-pill-badge">New</span>
            <span>AI Mock Sessions with Real-Time Feedback</span>
          </div>

          <h1 className="hero-headline">
            Master Your Next Tech Interview with{" "}
            <span className="gradient-text">Intelligent AI Coaching</span>
          </h1>

          <p className="hero-subtitle">
            Practice realistic technical and behavioral interviews tailored to your exact role and experience level.
            Receive instant, actionable critique to land your dream offer.
          </p>

          <div className="hero-actions">
            <Link to="/setup">
              <Button variant="primary" size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Mock Interview
              </Button>
            </Link>
            <Link to="/interview/practice">
              <Button variant="secondary" size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Preview Session UI
              </Button>
            </Link>
          </div>

          {/* Interactive Card Mockup Preview */}
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
            <Card hoverable={false} className="animate-fade-in" style={{ border: "1px solid rgba(99, 102, 241, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Badge variant="primary">Senior Frontend Round</Badge>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Question 2 of 5</span>
                </div>
                <div className="audio-wave-container" title="AI Interviewer active">
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                </div>
              </div>

              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                "Can you explain how React's reconciliation algorithm works and how the virtual DOM differs from the real DOM?"
              </h3>

              <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Candidate Answer Sample:</span>
                  <Badge variant="emerald">Score: 92/100</Badge>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", margin: 0 }}>
                  "React maintains an in-memory representation called the Virtual DOM. When state changes occur, React creates a new tree and diffs it with the previous one..."
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <Badge variant="cyan">Clarity: 95%</Badge>
                <Badge variant="emerald">Technical Depth: 90%</Badge>
                <Badge variant="purple">STAR Structure: 88%</Badge>
              </div>
            </Card>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">98%</span>
              <span className="hero-stat-label">Confidence Improvement</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">15k+</span>
              <span className="hero-stat-label">Mock Rounds Completed</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">4.9 / 5</span>
              <span className="hero-stat-label">User Satisfaction</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">&lt; 10s</span>
              <span className="hero-stat-label">Instant Evaluation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "5rem 0", background: "rgba(255, 255, 255, 0.01)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why AI Interview Coach</span>
            <h2 className="section-title">Everything You Need to Ace Tech Interviews</h2>
            <p>Built by engineers for engineers. Hone your technical clarity, storytelling, and problem-solving skills under timed conditions.</p>
          </div>

          <div className="grid-2">
            {features.map((item, idx) => (
              <Card key={idx} className="feature-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="feature-icon-wrapper">{item.icon}</div>
                  <Badge variant="primary">{item.badge}</Badge>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.95rem" }}>{item.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Methodology</span>
            <h2 className="section-title">How It Works in 3 Simple Steps</h2>
            <p>From prompt selection to granular feedback, experience the fastest way to interview readiness.</p>
          </div>

          <div className="grid-3">
            <Card>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "1rem" }}>
                01
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Configure Your Session</h3>
              <p style={{ fontSize: "0.9rem" }}>
                Select your engineering discipline, target experience tier, and focus areas like React, System Design, or Behavioral.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-secondary)", marginBottom: "1rem" }}>
                02
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Answer in the Hot Seat</h3>
              <p style={{ fontSize: "0.9rem" }}>
                Face realistic, progressive questions. Type or dictate your structured response under standard interview timer limits.
              </p>
            </Card>

            <Card>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-emerald)", marginBottom: "1rem" }}>
                03
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Review & Elevate</h3>
              <p style={{ fontSize: "0.9rem" }}>
                Inspect your AI-evaluated scorecard with feedback on strengths, omitted key concepts, and model answers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Domains & Categories */}
      <section style={{ padding: "5rem 0", background: "rgba(255, 255, 255, 0.015)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Supported Roles</span>
            <h2 className="section-title">Explore Interview Domains</h2>
            <p>Targeted interview tracks curated for specific engineering disciplines.</p>
          </div>

          <div className="grid-3">
            {categories.map((cat, idx) => (
              <Card key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ fontSize: "1.75rem" }}>{cat.icon}</div>
                <h4 style={{ fontSize: "1.15rem" }}>{cat.title}</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{cat.roleCount}</p>
                <Link to="/setup" style={{ marginTop: "auto", color: "var(--accent-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
                  Practice track →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section style={{ padding: "6rem 0", textAlign: "center" }}>
        <div className="container container-narrow">
          <Card style={{ padding: "3.5rem 2rem", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))", borderColor: "rgba(99, 102, 241, 0.3)" }}>
            <h2 style={{ fontSize: "2.25rem", marginBottom: "1rem" }}>
              Ready to Ace Your Next Interview?
            </h2>
            <p style={{ marginBottom: "2rem", fontSize: "1.05rem" }}>
              Join thousands of developers leveling up their interview skills with personalized AI coaching.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/setup">
                <Button variant="primary" size="lg">Configure Mock Session</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">Create Free Account</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default Home;