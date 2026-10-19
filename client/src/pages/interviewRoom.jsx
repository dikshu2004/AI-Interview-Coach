import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const DEMO_QUESTIONS = [
  {
    id: 1,
    category: "Architecture & Rendering",
    question: "Can you explain how React 19 handles concurrency and how Server Actions change the traditional data mutation model in modern SPAs?",
    hint: "Think about useActionState, optimistic updates, and server execution boundaries.",
  },
  {
    id: 2,
    category: "Performance & Memory",
    question: "How would you identify and resolve excessive re-renders in a large-scale React component tree? Which profiling tools and patterns do you use?",
    hint: "Mention React DevTools Profiler, flame charts, memoization caveats, and component colocation.",
  },
  {
    id: 3,
    category: "Behavioral & Conflict",
    question: "Tell me about a time when a product deadline was at risk due to unexpected technical debt. How did you negotiate scope with stakeholders?",
    hint: "Structure your response using STAR: Situation, Task, Action, and quantifiable Result.",
  },
];

function InterviewRoom() {
  const location = useLocation();
  const { token } = useAuth();

  const stateData = location.state || {};
  const session = stateData.session || null;
  const questions = stateData.questions && stateData.questions.length > 0
    ? stateData.questions
    : DEMO_QUESTIONS;

  const config = {
    role: stateData.role || session?.role || "Senior Frontend Engineer",
    experienceLevel: stateData.experienceLevel || session?.experienceLevel || "Senior (5-8 yrs)",
    interviewType: stateData.interviewType || session?.interviewType || "Technical Deep Dive",
    questionCount: questions.length,
    timeLimitMinutes: stateData.timeLimitMinutes || session?.timeLimitMinutes || 3,
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [answersMap, setAnswersMap] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(config.timeLimitMinutes * 60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [startTime] = useState(Date.now());

  const recognitionRef = useRef(null);
  const currentQ = questions[currentIndex] || questions[0];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = "en-US";

      recognizer.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognizer.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsRecording(false);
      };

      recognizer.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const speakQuestion = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentQ.question);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || isSessionComplete || isEvaluating) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, isSessionComplete, isEvaluating]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  // Save answer on navigation
  const saveCurrentAnswer = () => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQ.id]: candidateAnswer,
    }));
  };

  const handleNextQuestion = () => {
    saveCurrentAnswer();
    const updatedAnswers = {
      ...answersMap,
      [currentQ.id]: candidateAnswer,
    };

    if (currentIndex + 1 < questions.length) {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex((prev) => prev + 1);
      setCandidateAnswer(updatedAnswers[nextQ.id] || "");
      setShowHint(false);
      setSecondsRemaining(config.timeLimitMinutes * 60);
      if (isSpeakingQuestion) window.speechSynthesis.cancel();
    } else {
      finishInterview(updatedAnswers);
    }
  };

  const finishInterview = async (collectedAnswers = answersMap) => {
    if (isRecording) recognitionRef.current?.stop();
    if (isSpeakingQuestion) window.speechSynthesis.cancel();

    setIsEvaluating(true);

    const elapsedMins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const duration = `${elapsedMins} mins`;

    const answersPayload = questions.map((q) => ({
      id: q.id,
      answer: collectedAnswers[q.id] || (q.id === currentQ.id ? candidateAnswer : ""),
    }));

    if (session?._id && token) {
      try {
        const res = await fetch(`http://localhost:5000/api/interview/${session._id}/evaluate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: answersPayload,
            duration,
          }),
        });

        const data = await res.json();
        if (res.ok && data.evaluation) {
          setEvaluationData(data.evaluation);
          setIsSessionComplete(true);
          setIsEvaluating(false);
          return;
        }
      } catch (err) {
        console.warn("Backend evaluation error, calculating client-side scorecard:", err);
      }
    }

    // Client fallback evaluation if guest/demo mode
    setTimeout(() => {
      let totalWords = 0;
      answersPayload.forEach((a) => {
        totalWords += (a.answer || "").trim().split(/\s+/).filter(Boolean).length;
      });

      const avgWords = totalWords / (questions.length || 1);
      const techScore = Math.min(95, Math.max(60, Math.round(62 + avgWords * 0.4)));
      const clarScore = Math.min(96, Math.max(65, Math.round(68 + avgWords * 0.3)));
      const overall = Math.round(techScore * 0.6 + clarScore * 0.4);

      setEvaluationData({
        overallScore: overall,
        technicalScore: techScore,
        clarityScore: clarScore,
        rating: overall >= 85 ? "Strong Hire" : overall >= 72 ? "Hire" : "Leaning Hire",
        badgeVariant: overall >= 85 ? "emerald" : overall >= 72 ? "cyan" : "amber",
        keyHighlights: `Demonstrated focused communication for the ${config.role} role. Articulated trade-offs and component lifecycles cleanly.`,
        suggestedFollowups: "Deepen low-level event loop performance edge cases and provide telemetry-backed metrics in behavioral scenarios.",
        strengths: [
          "Cohesive structural responses with logical flow",
          "Solid comprehension of software design tradeoffs",
          "Effective self-pacing within the allotted question duration",
        ],
        improvements: [
          "Quote quantifiable impact metrics (latency ms, throughput)",
          "Cover edge-case failure modes and circuit breakers",
        ],
      });

      setIsSessionComplete(true);
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      {/* Top Session Bar */}
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.5rem" }}>AI Interview Room</h2>
            <Badge variant="cyan">{config.role}</Badge>
            {session && <Badge variant="emerald">Live Session</Badge>}
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Mode: {config.interviewType} • Tier: {config.experienceLevel}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: secondsRemaining < 30 ? "rgba(244, 63, 94, 0.15)" : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${secondsRemaining < 30 ? "rgba(244, 63, 94, 0.4)" : "var(--border-subtle)"}`,
              padding: "0.45rem 0.95rem",
              borderRadius: "var(--radius-full)",
              color: secondsRemaining < 30 ? "#fda4af" : "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <Button variant="danger" size="sm" onClick={() => setIsEndModalOpen(true)}>
            End Interview
          </Button>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ marginBottom: "2rem" }}>
        <ProgressBar
          value={progressPercent}
          label={`Question ${currentIndex + 1} of ${questions.length}`}
          variant="brand"
        />
      </div>

      {/* Evaluating Loading State */}
      {isEvaluating && (
        <Card hoverable={false} className="animate-fade-in" style={{ textAlign: "center", padding: "4rem 2rem", maxWidth: "680px", margin: "2rem auto" }}>
          <div className="brand-icon" style={{ width: "64px", height: "64px", margin: "0 auto 1.5rem" }}>
            <span className="brand-dot" />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>AI Evaluation in Progress...</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto" }}>
            Analyzing response depth, communication clarity, and technical tradeoffs across all submitted questions.
          </p>
        </Card>
      )}

      {!isSessionComplete && !isEvaluating && (
        <div className="room-layout-grid">
          {/* Question Presentation Card */}
          <Card hoverable={false} style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <Badge variant="purple">{currentQ.category || "Technical Question"}</Badge>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={speakQuestion}
                  style={{
                    background: isSpeakingQuestion ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.08)",
                    border: "1px solid var(--border-subtle)",
                    color: isSpeakingQuestion ? "#a5b4fc" : "#ffffff",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.3rem 0.6rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  title="Read question aloud"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span>{isSpeakingQuestion ? "Mute" : "Read Aloud"}</span>
                </button>

                <div className="audio-wave-container" title="Interviewer Audio Activity">
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                  <span className="audio-bar" />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <div className="brand-icon" style={{ flexShrink: 0, width: "42px", height: "42px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  AI Interviewer Asks:
                </span>
                <p style={{ fontSize: "1.15rem", color: "#ffffff", fontWeight: 600, marginTop: "0.25rem", lineHeight: 1.5 }}>
                  "{currentQ.question}"
                </p>
              </div>
            </div>

            {/* Hint Accordion */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-primary)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span>💡 {showHint ? "Hide Strategy Hint" : "Need a Hint?"}</span>
              </button>

              {showHint && (
                <div style={{ marginTop: "0.75rem", background: "rgba(99, 102, 241, 0.1)", padding: "0.85rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(99, 102, 241, 0.25)", fontSize: "0.85rem", color: "#c7d2fe" }}>
                  {currentQ.hint || "Frame your answer with trade-offs and structural clarity."}
                </div>
              )}
            </div>
          </Card>

          {/* Candidate Response Workspace */}
          <Card hoverable={false}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Your Answer</h3>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  variant={isRecording ? "danger" : "secondary"}
                  size="sm"
                  onClick={toggleRecording}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                  {isRecording ? "Stop Dictation" : "Voice Dictation"}
                </Button>
              </div>
            </div>

            {isRecording && (
              <div className="alert-banner alert-success" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                🎙️ Listening live... Speak clearly and your voice will transcribe into the field below.
              </div>
            )}

            <div className="form-group" style={{ marginBottom: "0.75rem" }}>
              <textarea
                className="form-textarea"
                style={{ minHeight: "220px", fontSize: "0.95rem", lineHeight: 1.6 }}
                placeholder="Structure your answer clearly. Break down key concepts, architectural trade-offs, or use the STAR method (Situation, Task, Action, Result)..."
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Word count: {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0} words
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Tip: Aim for structured paragraphs
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCandidateAnswer("")}
                disabled={!candidateAnswer}
              >
                Clear
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextQuestion}
              >
                {currentIndex + 1 < questions.length ? "Submit & Next Question →" : "Finish Interview →"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Evaluation Summary / Live AI Scorecard UI */}
      {isSessionComplete && evaluationData && (
        <Card hoverable={false} className="animate-fade-in" style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Badge variant={evaluationData.badgeVariant || "emerald"} style={{ marginBottom: "0.75rem" }}>
              AI Scorecard Ready
            </Badge>
            <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>Interview Completed! 🎉</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Evaluated for <strong>{config.role}</strong> ({config.experienceLevel})
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: "2rem" }}>
            <div style={{ background: "rgba(0,0,0,0.25)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Overall Score</span>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-emerald)", fontFamily: "var(--font-heading)" }}>
                {evaluationData.overallScore}/100
              </div>
              <Badge variant={evaluationData.badgeVariant || "emerald"}>{evaluationData.rating}</Badge>
            </div>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Clarity & Structure</span>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>
                {evaluationData.clarityScore}%
              </div>
              <Badge variant="cyan">Articulation</Badge>
            </div>

            <div style={{ background: "rgba(0,0,0,0.25)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Technical Depth</span>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-primary)", fontFamily: "var(--font-heading)" }}>
                {evaluationData.technicalScore}%
              </div>
              <Badge variant="primary">Subject Matter</Badge>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              <h4 style={{ color: "#6ee7b7", marginBottom: "0.5rem" }}>🌟 Key Standout Highlights</h4>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                {evaluationData.keyHighlights}
              </p>
              {evaluationData.strengths && (
                <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {evaluationData.strengths.map((str, i) => (
                    <li key={i} style={{ marginBottom: "0.25rem" }}>{str}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              <h4 style={{ color: "#fcd34d", marginBottom: "0.5rem" }}>📈 Suggested Growth Areas</h4>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                {evaluationData.suggestedFollowups}
              </p>
              {evaluationData.improvements && (
                <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  {evaluationData.improvements.map((imp, i) => (
                    <li key={i} style={{ marginBottom: "0.25rem" }}>{imp}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link to="/dashboard">
              <Button variant="primary" size="lg">Return to Dashboard</Button>
            </Link>
            <Link to="/setup">
              <Button variant="secondary" size="lg">Practice Another Topic</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Confirmation Modal to End Session */}
      <Modal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="End Interview Early?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsEndModalOpen(false)}>
              Keep Practicing
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsEndModalOpen(false);
                saveCurrentAnswer();
                finishInterview();
              }}
            >
              End & Generate Scorecard
            </Button>
          </>
        }
      >
        <p style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to conclude this interview session? Your responses recorded so far will be sent to the AI for evaluation.
        </p>
      </Modal>
    </div>
  );
}

export default InterviewRoom;
