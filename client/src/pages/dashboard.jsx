import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import Tabs from "../components/Tabs";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const SAMPLE_SESSIONS = [
  {
    id: "sample-1",
    role: "Senior React Developer",
    topic: "React 19, Virtual DOM, & Performance",
    date: "Recent Sample",
    duration: "24 mins",
    score: 92,
    badgeVariant: "emerald",
    rating: "Strong Hire",
    feedback: {
      technical: 94,
      clarity: 90,
      structure: 92,
      strengths: ["Clear explanation of fiber reconciler", "Solid grasp of useMemo tradeoffs"],
      improvements: ["Could have mentioned React Server Components edge-cases"],
    },
  },
  {
    id: "sample-2",
    role: "Full-Stack Engineer",
    topic: "System Design: Scalable URL Shortener",
    date: "Recent Sample",
    duration: "32 mins",
    score: 84,
    badgeVariant: "cyan",
    rating: "Hire",
    feedback: {
      technical: 82,
      clarity: 88,
      structure: 84,
      strengths: ["Great database schema indexing choices", "Clear discussion on Redis caching"],
      improvements: ["Address base62 hashing collisions earlier in the flow"],
    },
  },
];

const SKILL_BREAKDOWN = [
  { name: "React & Modern JavaScript", score: 92, variant: "brand" },
  { name: "System Design & Architecture", score: 84, variant: "cyan" },
  { name: "Data Structures & Algorithms", score: 79, variant: "brand" },
  { name: "Behavioral Communication (STAR)", score: 88, variant: "emerald" },
  { name: "API & Distributed Systems", score: 81, variant: "cyan" },
];

function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("sessions");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbSessions, setDbSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    strongHireRate: 0,
    hoursPracticed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch real user sessions
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/interview/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = (data.sessions || []).map((s) => ({
            id: s._id,
            role: s.role,
            topic: (s.tags && s.tags.length > 0) ? s.tags.join(", ") : s.interviewType,
            date: new Date(s.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            duration: s.duration || `${(s.questionCount || 3) * (s.timeLimitMinutes || 3)} mins`,
            score: s.overallScore || 0,
            badgeVariant: s.badgeVariant || "cyan",
            rating: s.rating || "Completed",
            feedback: {
              technical: s.technicalScore || 75,
              clarity: s.clarityScore || 80,
              structure: s.overallScore || 75,
              strengths: (s.strengths && s.strengths.length > 0)
                ? s.strengths
                : ["Clear structured thoughts", "Good foundational explanations"],
              improvements: (s.improvements && s.improvements.length > 0)
                ? s.improvements
                : ["Deepen architectural trade-offs", "Add telemetry benchmarks"],
            },
          }));

          setDbSessions(mapped);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch sessions history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const displaySessions = dbSessions.length > 0 ? dbSessions : SAMPLE_SESSIONS;
  const isUsingSample = dbSessions.length === 0;

  const handleOpenFeedback = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const filteredSessions = displaySessions.filter(
    (s) =>
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabsConfig = [
    { id: "sessions", label: "Past Sessions", badge: displaySessions.length },
    { id: "skills", label: "Skill Breakdown" },
    { id: "recommended", label: "Recommended Topics" },
  ];

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      {/* Top Welcome Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontSize: "2rem" }}>
              {isAuthenticated ? `Welcome back, ${user?.name || "Candidate"}` : "Candidate Dashboard"}
            </h1>
            <Badge variant="primary">Target: Senior Engineer</Badge>
          </div>
          <p>Track your interview progress, mock evaluations, and AI feedback history.</p>
        </div>

        <Link to="/setup">
          <Button variant="primary" size="lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Mock Interview
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: "2.5rem" }}>
        <Card hoverable={false}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total Sessions</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
            <h2 style={{ fontSize: "2.2rem" }}>{stats.totalSessions || (isUsingSample ? 2 : 0)}</h2>
            <span style={{ color: "var(--accent-emerald)", fontSize: "0.85rem", fontWeight: 600 }}>Active</span>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Across targeted tracks</p>
        </Card>

        <Card hoverable={false}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Average Score</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
            <h2 style={{ fontSize: "2.2rem" }}>{stats.avgScore ? `${stats.avgScore}%` : (isUsingSample ? "88%" : "N/A")}</h2>
            <Badge variant="emerald">Strong Pace</Badge>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Standard benchmarks</p>
        </Card>

        <Card hoverable={false}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Practice Time</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
            <h2 style={{ fontSize: "2.2rem" }}>{stats.hoursPracticed ? `${stats.hoursPracticed}h` : (isUsingSample ? "1.2h" : "0h")}</h2>
            <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 600 }}>Recorded</span>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Live interview drills</p>
        </Card>

        <Card hoverable={false}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Strong Hire Rate</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.4rem" }}>
            <h2 style={{ fontSize: "2.2rem" }}>{stats.strongHireRate ? `${stats.strongHireRate}%` : (isUsingSample ? "75%" : "0%")}</h2>
            <span style={{ color: "var(--accent-emerald)", fontSize: "0.85rem", fontWeight: 600 }}>Calibrated</span>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>AI evaluation standards</p>
        </Card>
      </div>

      {isUsingSample && (
        <div className="alert-banner alert-success" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>💡 Showing sample benchmarks below. Complete a mock session to record your personalized scorecard history!</span>
          <Link to="/setup">
            <Button variant="secondary" size="sm">Start Practice</Button>
          </Link>
        </div>
      )}

      {/* Tabs Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "sessions" && (
          <div style={{ minWidth: "260px" }}>
            <input
              type="text"
              placeholder="Filter sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
            />
          </div>
        )}
      </div>

      {/* Tab 1: Past Sessions */}
      {activeTab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <Card
                key={session.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                }}
              >
                <div style={{ flex: 1, minWidth: "280px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                    <h3 style={{ fontSize: "1.15rem" }}>{session.role}</h3>
                    <Badge variant={session.badgeVariant}>{session.rating}</Badge>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    Focus: {session.topic}
                  </p>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    📅 {session.date} • ⏱️ {session.duration}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: "700", fontFamily: "var(--font-heading)" }}>
                      {session.score}/100
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Overall AI Score</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenFeedback(session)}
                    >
                      View Feedback
                    </Button>
                    <Link to="/setup">
                      <Button variant="ghost" size="sm">
                        Practice
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="No Sessions Found"
              description="No mock interview sessions matched your search query."
              actionLabel="Launch New Interview"
              onAction={() => (window.location.href = "/setup")}
            />
          )}
        </div>
      )}

      {/* Tab 2: Skill Breakdown */}
      {activeTab === "skills" && (
        <div className="grid-2">
          <Card hoverable={false}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>Core Engineering Metrics</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {SKILL_BREAKDOWN.map((skill, idx) => (
                <ProgressBar
                  key={idx}
                  value={skill.score}
                  label={skill.name}
                  variant={skill.variant}
                />
              ))}
            </div>
          </Card>

          <Card hoverable={false}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>AI Interviewer Observations</h3>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              Your communication scores highlight strong structured reasoning with technical depth in JavaScript concurrency and API contracts.
            </p>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
              <h4 style={{ color: "var(--accent-primary)", fontSize: "0.95rem", marginBottom: "0.4rem" }}>
                🎯 Highest Leverage Recommendation
              </h4>
              <p style={{ fontSize: "0.85rem", color: "#c7d2fe" }}>
                In corporate system design rounds, spend the first 3 minutes establishing hard numeric constraints (QPS, storage, latency bounds) before drawing schemas.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Recommended Topics */}
      {activeTab === "recommended" && (
        <div className="grid-3">
          <Card>
            <Badge variant="cyan" style={{ marginBottom: "0.75rem" }}>Architecture</Badge>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Distributed Caching & Invalidation</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Master cache-aside, write-through patterns, Redis clusters, and stampede prevention.
            </p>
            <Link to="/setup">
              <Button variant="outline" size="sm" className="btn-full">Start 15m Drill</Button>
            </Link>
          </Card>

          <Card>
            <Badge variant="emerald" style={{ marginBottom: "0.75rem" }}>React Internals</Badge>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Fiber Reconciler & Concurrent Mode</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Practice answering questions regarding useTransition, useActionState, and async rendering pipelines.
            </p>
            <Link to="/setup">
              <Button variant="outline" size="sm" className="btn-full">Start 15m Drill</Button>
            </Link>
          </Card>

          <Card>
            <Badge variant="purple" style={{ marginBottom: "0.75rem" }}>Behavioral</Badge>
            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Handling Scope Creep with PMs</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Formulate crisp STAR answers demonstrating engineering trade-offs and pragmatic leadership.
            </p>
            <Link to="/setup">
              <Button variant="outline" size="sm" className="btn-full">Start 15m Drill</Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Detailed Feedback Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSession ? `AI Feedback: ${selectedSession.role}` : "Session Feedback"}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Link to="/setup">
              <Button variant="primary" size="sm">
                Retake Topic
              </Button>
            </Link>
          </>
        }
      >
        {selectedSession && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Overall Verdict</span>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#ffffff" }}>{selectedSession.rating}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Score</span>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-emerald)" }}>{selectedSession.score}/100</div>
              </div>
            </div>

            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>Performance Breakdown</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <ProgressBar value={selectedSession.feedback.technical} label="Technical Depth & Correctness" variant="brand" />
              <ProgressBar value={selectedSession.feedback.clarity} label="Communication & Articulation" variant="cyan" />
              <ProgressBar value={selectedSession.feedback.structure} label="Structured STAR / Logical Flow" variant="emerald" />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <h4 style={{ fontSize: "0.95rem", color: "#6ee7b7", marginBottom: "0.5rem" }}>✨ Key Strengths</h4>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {selectedSession.feedback.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: "0.95rem", color: "#fcd34d", marginBottom: "0.5rem" }}>🎯 Opportunities for Growth</h4>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {selectedSession.feedback.improvements.map((imp, idx) => (
                  <li key={idx}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;