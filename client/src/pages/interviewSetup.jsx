import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { useAuth } from "../context/AuthContext";

const POPULAR_TAGS = [
  "React 19 & Hooks",
  "TypeScript",
  "System Scalability",
  "REST & GraphQL",
  "Node.js Event Loop",
  "Database Indexing",
  "STAR Behavioral",
  "State Management",
  "Microservices",
  "CI/CD Pipelines",
];

function InterviewSetup() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [role, setRole] = useState("Frontend Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Senior (5-8 yrs)");
  const [interviewType, setInterviewType] = useState("Technical Deep Dive");
  const [questionCount, setQuestionCount] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(3);
  const [selectedTags, setSelectedTags] = useState(["React 19 & Hooks", "TypeScript"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
      setCustomTagInput("");
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsStarting(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          experienceLevel,
          interviewType,
          questionCount,
          timeLimitMinutes,
          tags: selectedTags,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate interview questions");
      }

      navigate("/interview/practice", {
        state: {
          session: data.session,
          questions: data.session.questions,
          role,
          experienceLevel,
          interviewType,
          questionCount,
          timeLimitMinutes,
          selectedTags,
        },
      });
    } catch (err) {
      console.error("Start interview error:", err);
      setErrorMessage(err.message || "Something went wrong generating your interview.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "800px", marginBottom: "2.5rem" }}>
        <Badge variant="primary" style={{ marginBottom: "0.5rem" }}>Session Configuration</Badge>
        <h1 style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>Customize Your Mock Interview</h1>
        <p>Configure your target discipline, question focus, and time settings before entering the AI interview room.</p>
      </div>

      <div className="setup-layout-grid">
        {/* Left Form Column */}
        <form onSubmit={handleStartInterview}>
          <Card hoverable={false} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>1. Role & Seniority</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="setup-role">Target Role</label>
              <select
                id="setup-role"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Frontend Engineer">Frontend Engineer (React / TypeScript)</option>
                <option value="Backend Engineer">Backend Engineer (Node / Go / Python)</option>
                <option value="Full-Stack Developer">Full-Stack Developer (MERN / Next.js)</option>
                <option value="System Architect">System Architect & Distributed Systems</option>
                <option value="DevOps Engineer">DevOps & Cloud Infrastructure</option>
                <option value="Engineering Manager">Engineering Manager / Team Lead</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="setup-exp">Experience Tier</label>
              <select
                id="setup-exp"
                className="form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Junior / Entry (0-2 yrs)">Junior / Entry-Level (0-2 yrs)</option>
                <option value="Mid-Level (2-5 yrs)">Mid-Level (2-5 yrs)</option>
                <option value="Senior (5-8 yrs)">Senior Engineer (5-8 yrs)</option>
                <option value="Lead / Principal (8+ yrs)">Lead / Principal / Staff (8+ yrs)</option>
              </select>
            </div>
          </Card>

          <Card hoverable={false} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.25rem" }}>2. Interview Style & Limits</h3>

            <div className="form-group">
              <label className="form-label">Interview Mode</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                {[
                  { id: "Technical Deep Dive", label: "Technical Deep Dive", desc: "Core concepts & syntax" },
                  { id: "System Architecture", label: "System Design", desc: "Scale, caching & schema" },
                  { id: "Behavioral & Leadership", label: "Behavioral (STAR)", desc: "Culture & soft skills" },
                  { id: "Mixed Comprehensive", label: "Mixed Round", desc: "Combined 360° evaluation" },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setInterviewType(mode.id)}
                    style={{
                      padding: "0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: interviewType === mode.id ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      background: interviewType === mode.id ? "rgba(99, 102, 241, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: interviewType === mode.id ? "#ffffff" : "var(--text-secondary)" }}>
                      {mode.label}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {mode.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="setup-count">Question Count</label>
                <select
                  id="setup-count"
                  className="form-select"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                >
                  <option value={3}>3 Questions (Quick Drill ~ 10m)</option>
                  <option value={5}>5 Questions (Standard ~ 20m)</option>
                  <option value={10}>10 Questions (Full Mock ~ 40m)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="setup-limit">Time Per Question</label>
                <select
                  id="setup-limit"
                  className="form-select"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                >
                  <option value={2}>2 Minutes (Rapid)</option>
                  <option value={3}>3 Minutes (Standard)</option>
                  <option value={5}>5 Minutes (Extended)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card hoverable={false}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>3. Focus Topics & Tags</h3>
            <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>
              Click to select topics or add custom focus technologies:
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      background: isSelected ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                      color: isSelected ? "#ffffff" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="Add custom topic (e.g. Next.js 15, Docker)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="form-input"
                style={{ fontSize: "0.85rem" }}
              />
              <Button variant="secondary" size="sm" onClick={handleAddCustomTag}>
                Add Tag
              </Button>
            </div>
          </Card>
        </form>

        {/* Right Live Summary Sidebar */}
        <div style={{ position: "sticky", top: "96px" }}>
          <Card hoverable={false} style={{ borderColor: "rgba(99, 102, 241, 0.35)", background: "rgba(18, 24, 38, 0.85)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.15rem" }}>Session Overview</h3>
              <Badge variant="emerald">Ready to Launch</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Target Role</span>
                <div style={{ fontWeight: 600, color: "#ffffff" }}>{role}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Seniority</span>
                <div style={{ fontWeight: 600, color: "#ffffff" }}>{experienceLevel}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Interview Mode</span>
                <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{interviewType}</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Questions</span>
                  <div style={{ fontWeight: 600 }}>{questionCount} items</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Est. Time</span>
                  <div style={{ fontWeight: 600 }}>~{questionCount * timeLimitMinutes} mins</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Selected Topics</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.35rem" }}>
                  {selectedTags.length > 0 ? (
                    selectedTags.map((t, idx) => (
                      <span key={idx} style={{ background: "rgba(255, 255, 255, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem" }}>
                        {t}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No specific tags selected</span>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="alert-banner alert-error" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
                {errorMessage}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="btn-full"
              loading={isStarting}
              onClick={handleStartInterview}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {isStarting ? "Preparing Room..." : "Start Interview Session"}
            </Button>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.85rem" }}>
              Audio & Text inputs available. Feedback evaluated post-session.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default InterviewSetup;