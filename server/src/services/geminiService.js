import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return null;
  }
  const client = new GoogleGenerativeAI(apiKey.trim());
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  return client.getGenerativeModel({ model: modelName });
};

const parseGeminiJson = (rawText, expectedType = "object") => {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const startChar = expectedType === "array" ? "[" : "{";
  const endChar = expectedType === "array" ? "]" : "}";
  const start = cleaned.indexOf(startChar);
  const end = cleaned.lastIndexOf(endChar);
  const slice = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice);
};

// Fresher & entry-level curated opening banks
const FRESHER_OPENING_BANKS = {
  frontend: [
    {
      category: "React & UI Fundamentals",
      question: "What is the difference between props and state in React, and how do you decide which one to use in a component?",
      hint: "Explain who owns and updates the data, immutability of props, and a small example like a counter or form input.",
    },
    {
      category: "JavaScript Core",
      question: "How do let, const, and var differ in JavaScript, and what does hoisting mean for beginners?",
      hint: "Mention block scope vs function scope, reassignment rules, and temporal dead zone basics.",
    },
    {
      category: "Web & CSS Basics",
      question: "How does CSS Flexbox differ from CSS Grid, and when would you pick one over the other in a web page layout?",
      hint: "Compare one-dimensional (row or column) vs two-dimensional layouts with a quick navbar or card-grid example.",
    },
  ],
  backend: [
    {
      category: "API & HTTP Fundamentals",
      question: "What happens step by step when a browser sends a GET or POST request to a REST API, and how do common status codes like 200, 201, 400, 401, and 404 differ?",
      hint: "Walk through request URL/headers/body, server routing, and why choosing clear status codes helps the frontend.",
    },
    {
      category: "Databases & Data Modeling",
      question: "What are the main differences between a relational SQL database and a NoSQL database like MongoDB, and why might you pick one for a student or starter project?",
      hint: "Compare tables/schemas/joins vs flexible JSON documents and give a simple example like users and orders.",
    },
    {
      category: "Node.js & Async Basics",
      question: "Why is asynchronous programming important in Node.js, and how do Promises and async/await make async code easier to manage?",
      hint: "Mention non-blocking I/O, try/catch error handling with async/await, and avoiding nested callbacks.",
    },
  ],
  fundamentals: [
    {
      category: "OOP & Data Structures",
      question: "Can you explain the four core principles of Object-Oriented Programming (encapsulation, abstraction, inheritance, polymorphism) using a simple real-world example?",
      hint: "Keep it concrete—for instance, modeling a User, Vehicle, or Payment class from a college or personal project.",
    },
    {
      category: "Data Structures & Algorithms",
      question: "How do an array and a hash map (object/dictionary) compare for looking up items, and when would you choose a hash map in a coding problem?",
      hint: "Mention index-based access vs key-value lookup, O(n) scan vs O(1) average lookup, and an example like counting frequencies.",
    },
    {
      category: "Git & Debugging",
      question: "Walk me through how you debug a bug when an API call or UI feature fails in one of your projects.",
      hint: "Mention reproducing the issue, browser DevTools / console logs, checking network responses, and isolating the root cause.",
    },
  ],
  behavioral: [
    {
      category: "Teamwork & Learning (STAR)",
      question: "Tell me about a college, internship, or personal project you are proud of. What was your role, and what technical challenge did you have to figure out?",
      hint: "Use the STAR method: Situation, Task, Action you personally took, and the Result or what you learned.",
    },
    {
      category: "Growth & Collaboration",
      question: "Describe a time you got stuck on a bug or received constructive feedback on your code. How did you approach fixing it?",
      hint: "Highlight how you researched, asked thoughtful questions, and applied what you learned afterward.",
    },
  ],
};

// Concept keyword -> fresher-friendly follow-up generators
const CONCEPT_FOLLOWUPS = [
  {
    keywords: ["state", "usestate", "props"],
    category: "React State & Data Flow",
    build: (term) => ({
      question: `You mentioned "${term}" in your previous answer. What happens in React when state updates, and how would you pass data cleanly between a parent component and a child component?`,
      hint: "Mention re-rendering, lifting state up, and avoiding unnecessary prop mutations.",
    }),
  },
  {
    keywords: ["useeffect", "hook", "hooks", "lifecycle"],
    category: "React Hooks & Side Effects",
    build: () => ({
      question: "You brought up React hooks. How does the dependency array in useEffect control when an effect runs, and what happens if you forget to include a dependency or cleanup function?",
      hint: "Cover empty [], specific dependencies, infinite loop pitfalls, and cleaning up timers or listeners.",
    }),
  },
  {
    keywords: ["virtual dom", "dom", "reconcil", "render"],
    category: "Rendering & DOM Basics",
    build: () => ({
      question: "Following up on DOM rendering—why do lists in React need a unique key prop, and why is using the array index as a key discouraged when items can be reordered or deleted?",
      hint: "Explain how React tracks list items across updates and what bugs can happen with input state when indices shift.",
    }),
  },
  {
    keywords: ["async", "await", "promise", "callback", "event loop"],
    category: "Asynchronous JavaScript",
    build: () => ({
      question: "You mentioned asynchronous execution. If you need to fetch data from two independent APIs at the same time using async/await, how would you run them in parallel and handle errors cleanly?",
      hint: "Mention Promise.all vs sequential awaits and wrapping awaits in try/catch.",
    }),
  },
  {
    keywords: ["api", "rest", "endpoint", "http", "express", "route", "middleware"],
    category: "REST API & Express Basics",
    build: () => ({
      question: "You touched on APIs/routes. How would you validate incoming request data in Express and return helpful error responses so the client knows what went wrong?",
      hint: "Mention checking req.body/req.params, Express middleware, and returning 400 vs 404 vs 500 status codes.",
    }),
  },
  {
    keywords: ["mongodb", "mongoose", "sql", "database", "schema", "query", "index"],
    category: "Database Fundamentals",
    build: () => ({
      question: "Since you mentioned databases, what is a database index in simple terms, and what trade-off does adding too many indexes introduce on writes?",
      hint: "Compare faster read lookups vs extra storage and slower insert/update operations.",
    }),
  },
  {
    keywords: ["jwt", "auth", "token", "bcrypt", "password", "login", "security"],
    category: "Authentication Basics",
    build: () => ({
      question: "You mentioned authentication. Why should user passwords always be hashed (for example with bcrypt) before saving to the database, and how does a JWT help verify subsequent requests?",
      hint: "Explain one-way hashing + salt vs encryption, and sending Bearer tokens in Authorization headers.",
    }),
  },
  {
    keywords: ["project", "internship", "team", "bug", "error", "debug", "git"],
    category: "Practical Experience & Problem Solving",
    build: () => ({
      question: "That sounds like a useful experience. Looking back at that project or bug, what is one thing you would build or test differently today with what you know now?",
      hint: "Talk about code organization, input validation, error handling, or clearer collaboration.",
    }),
  },
  {
    keywords: ["array", "hash", "map", "object", "loop", "complexity", "time", "space", "dsa"],
    category: "DSA & Complexity Basics",
    build: () => ({
      question: "Building on your explanation, how do you estimate the time and space complexity (Big-O) of a function you wrote, and how would you spot an O(n^2) nested loop bottleneck?",
      hint: "Explain counting operations relative to input size n and trading extra memory (like a Set or Map) for faster lookups.",
    }),
  },
];

const selectFresherBank = (role = "", interviewType = "") => {
  const lowerRole = role.toLowerCase();
  const lowerType = interviewType.toLowerCase();

  if (lowerType.includes("behavioral") || lowerType.includes("hr")) {
    return [
      ...FRESHER_OPENING_BANKS.behavioral,
      ...FRESHER_OPENING_BANKS.fundamentals,
      ...FRESHER_OPENING_BANKS.frontend,
    ];
  }
  if (lowerRole.includes("front") || lowerRole.includes("react") || lowerRole.includes("ui")) {
    return [
      ...FRESHER_OPENING_BANKS.frontend,
      ...FRESHER_OPENING_BANKS.fundamentals,
      ...FRESHER_OPENING_BANKS.behavioral,
    ];
  }
  if (lowerRole.includes("back") || lowerRole.includes("node") || lowerRole.includes("api") || lowerRole.includes("qa")) {
    return [
      ...FRESHER_OPENING_BANKS.backend,
      ...FRESHER_OPENING_BANKS.fundamentals,
      ...FRESHER_OPENING_BANKS.behavioral,
    ];
  }
  if (lowerRole.includes("trainee") || lowerRole.includes("intern") || lowerRole.includes("dsa")) {
    return [
      ...FRESHER_OPENING_BANKS.fundamentals,
      ...FRESHER_OPENING_BANKS.frontend,
      ...FRESHER_OPENING_BANKS.backend,
      ...FRESHER_OPENING_BANKS.behavioral,
    ];
  }
  return [
    ...FRESHER_OPENING_BANKS.frontend,
    ...FRESHER_OPENING_BANKS.backend,
    ...FRESHER_OPENING_BANKS.fundamentals,
    ...FRESHER_OPENING_BANKS.behavioral,
  ];
};

const formatQAHistory = (qaHistory = []) => {
  if (!Array.isArray(qaHistory) || qaHistory.length === 0) {
    return "(No previous questions yet)";
  }
  return qaHistory
    .map((item, idx) => {
      const qText = item.question || "";
      const aText = (item.candidateAnswer ?? item.answer ?? "").trim() || "(Candidate skipped or gave no answer)";
      return `Q${idx + 1} [${item.category || "General"}]: ${qText}\nCandidate Answer ${idx + 1}: ${aText}`;
    })
    .join("\n\n");
};

const extractHighlightSnippet = (answer = "") => {
  const cleaned = answer.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const words = cleaned.split(" ").filter((w) => w.length > 2);
  if (words.length <= 8) return cleaned;
  return words.slice(0, 8).join(" ") + "...";
};

/**
 * Generate ONLY the first interview question for a fresher / entry-level candidate
 */
export const generateFirstQuestionAI = async ({
  role = "Junior Frontend Developer",
  experienceLevel = "Fresher (0-1 yr)",
  interviewType = "Technical Fundamentals",
  tags = [],
}) => {
  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are a supportive, thorough technical interviewer conducting a mock interview for a FRESHER or ENTRY-LEVEL candidate (0-2 years experience, students, interns, or recent graduates).
Generate ONLY the FIRST (opening) question for:
- Target Role: ${role}
- Experience Level: ${experienceLevel}
- Interview Focus: ${interviewType}
- Focus Topics/Skills: ${tags.length > 0 ? tags.join(", ") : "Core CS and entry-level fundamentals"}

Guidelines:
- Keep the question clear, approachable, and realistic for a fresher/entry-level interview (avoid senior architecture, staff leadership, or multi-year production ops expectations).
- Focus on core concepts, practical code understanding, or coursework/project basics.

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "category": "Topic Name",
  "question": "Clear opening question text",
  "hint": "Brief encouraging hint or key points to mention"
}`;

      const result = await model.generateContent(prompt);
      const parsed = parseGeminiJson(result.response.text(), "object");
      if (parsed?.question) {
        return {
          id: 1,
          category: parsed.category || "Core Fundamentals",
          question: parsed.question,
          hint: parsed.hint || "Start with the core definition and support it with a simple project example.",
        };
      }
    } catch (err) {
      console.warn("Gemini first-question error, using fresher fallback:", err.message);
    }
  }

  const bank = selectFresherBank(role, interviewType);
  const first = bank[0];
  const focusTag = tags.length > 0 ? tags[0] : null;
  return {
    id: 1,
    category: first.category,
    question: focusTag
      ? `${first.question} Feel free to relate your explanation to ${focusTag}.`
      : first.question,
    hint: first.hint,
  };
};

/**
 * Generate the next adaptive question based on the candidate's previous Q&A history
 */
export const generateNextQuestionAI = async ({
  role = "Junior Frontend Developer",
  experienceLevel = "Fresher (0-1 yr)",
  interviewType = "Technical Fundamentals",
  tags = [],
  questionNumber = 2,
  totalQuestions = 3,
  qaHistory = [],
}) => {
  const model = getGeminiModel();
  const formattedHistory = formatQAHistory(qaHistory);

  if (model) {
    try {
      const prompt = `You are a supportive, observant technical interviewer interviewing a FRESHER / ENTRY-LEVEL candidate (${experienceLevel}) for a ${role} role (${interviewType}).
This is question ${questionNumber} of ${totalQuestions}.
Configured focus topics: ${tags.length > 0 ? tags.join(", ") : "Core fundamentals"}.

Conversation so far:
${formattedHistory}

Instructions:
1. Base this next question directly on the candidate's latest answer (and earlier context):
   - If they mentioned a specific concept, tool, or project, follow up on it or ask for a concrete example.
   - If their answer was brief, uncertain, or missed a key piece, gently probe that gap with a clear, fresher-appropriate question.
   - If they gave a solid complete answer, naturally progress one step deeper or connect it to a related practical scenario.
2. Keep the difficulty appropriate for a fresher / entry-level developer (no senior system-architecture or team-management expectations).
3. Do NOT repeat any question already asked above.

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "category": "Topic Name",
  "question": "Follow-up question text",
  "hint": "Helpful guiding tip for an entry-level candidate"
}`;

      const result = await model.generateContent(prompt);
      const parsed = parseGeminiJson(result.response.text(), "object");
      if (parsed?.question) {
        return {
          id: questionNumber,
          category: parsed.category || "Follow-up Assessment",
          question: parsed.question,
          hint: parsed.hint || "Walk through a concrete example step by step.",
        };
      }
    } catch (err) {
      console.warn("Gemini follow-up error, using adaptive fallback:", err.message);
    }
  }

  // Adaptive fallback using the candidate's latest answer and conversation history
  const askedQuestions = new Set(
    qaHistory.map((item) => (item.question || "").trim().toLowerCase())
  );
  const latestItem = qaHistory[qaHistory.length - 1] || {};
  const latestAnswer = (latestItem.candidateAnswer ?? latestItem.answer ?? "").trim();
  const lowerAnswer = latestAnswer.toLowerCase();
  const wordCount = latestAnswer ? latestAnswer.split(/\s+/).length : 0;

  // 1. If the latest answer was skipped or very short, gently scaffold on the same area
  if (wordCount < 8) {
    const prevCategory = latestItem.category || (tags[0] || "this topic");
    const gentleFollowup = {
      id: questionNumber,
      category: `${prevCategory} (Guided Follow-up)`,
      question: `No problem if the previous question felt broad. Focusing on ${prevCategory}, could you walk through a simple example from a college assignment or personal project, or explain the basic idea in your own words?`,
      hint: "Even a small example—like how a button updates a screen or how a route handles a request—is a great starting point.",
    };
    if (!askedQuestions.has(gentleFollowup.question.toLowerCase())) {
      return gentleFollowup;
    }
  }

  // 2. Look for a specific concept mentioned in the candidate's latest answer that hasn't been asked yet
  for (const matcher of CONCEPT_FOLLOWUPS) {
    const matchedTerm = matcher.keywords.find((kw) => lowerAnswer.includes(kw));
    if (matchedTerm) {
      const candidate = matcher.build(matchedTerm);
      if (!askedQuestions.has(candidate.question.toLowerCase())) {
        return {
          id: questionNumber,
          category: matcher.category,
          question: candidate.question,
          hint: candidate.hint,
        };
      }
    }
  }

  // 3. Otherwise build a non-repeating follow-up tied to what they wrote or the next bank item
  const snippet = extractHighlightSnippet(latestAnswer);
  const bank = selectFresherBank(role, interviewType);
  const unusedFromBank = bank.find(
    (item) => !askedQuestions.has(item.question.toLowerCase())
  );

  if (snippet && questionNumber % 2 === 0) {
    const probeQuestion = `In your last answer you wrote "${snippet}". Can you share a concrete code or project example of how you applied that, and mention one edge case or mistake to watch out for?`;
    if (!askedQuestions.has(probeQuestion.toLowerCase())) {
      return {
        id: questionNumber,
        category: latestItem.category || "Practical Follow-up",
        question: probeQuestion,
        hint: "Describe a real or sample scenario: inputs, expected behavior, and what happens when something goes wrong.",
      };
    }
  }

  if (unusedFromBank) {
    const tag = tags.length > 0 ? tags[(questionNumber - 1) % tags.length] : role;
    return {
      id: questionNumber,
      category: unusedFromBank.category,
      question: `${unusedFromBank.question} (Relating to ${tag} for an entry-level ${role} role.)`,
      hint: unusedFromBank.hint,
    };
  }

  // Final guaranteed unique fallback for longer (e.g., 10-question) sessions
  const focusTag = tags.length > 0 ? tags[(questionNumber - 1) % tags.length] : role;
  return {
    id: questionNumber,
    category: "Problem Solving & Reflection",
    question: `Building on your earlier answers for ${role}, how would you test and verify a small feature built with ${focusTag} before submitting your code for review?`,
    hint: "Mention manual test cases, boundary/empty inputs, checking console/server logs, and simple unit tests.",
  };
};

/**
 * Evaluate candidate answers using Gemini or fresher-appropriate fallback scoring
 */
export const evaluateInterviewAI = async ({
  role = "Junior Software Engineer",
  experienceLevel = "Fresher (0-1 yr)",
  questions = [],
  answers = [],
}) => {
  const model = getGeminiModel();

  if (model) {
    try {
      const prompt = `You are a fair, encouraging Engineering Interview Evaluator assessing a FRESHER / ENTRY-LEVEL candidate:
Role: ${role}
Experience Level: ${experienceLevel}

Questions and Candidate Responses:
${questions
  .map((q, idx) => {
    const ans = answers[idx] || "(No answer provided)";
    return `Q${idx + 1} [${q.category}]: ${q.question}\nCandidate Answer: ${ans}\n`;
  })
  .join("\n")}

Evaluate fairly for an entry-level / fresher bar (conceptual fundamentals, clarity of explanation, practical project examples, and basic edge-case awareness). Do not penalize for lacking senior-level architecture experience.

Respond ONLY with valid JSON (no markdown fences, no explanatory text):
{
  "overallScore": 82,
  "technicalScore": 84,
  "clarityScore": 80,
  "rating": "Hire",
  "badgeVariant": "cyan",
  "keyHighlights": "2-3 sentences summarizing standout fundamentals and communication",
  "suggestedFollowups": "2-3 sentences on beginner-friendly next steps, concepts to revise, or examples to practice",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement point 1", "Improvement point 2"],
  "questionFeedback": [
    {
      "id": 1,
      "score": 82,
      "feedback": "Specific fresher-appropriate feedback for question 1"
    }
  ]
}
Note: rating must be one of ["Strong Hire", "Hire", "Leaning Hire", "Needs Work"].
badgeVariant must be one of ["emerald", "cyan", "amber", "rose"].`;

      const result = await model.generateContent(prompt);
      const parsed = parseGeminiJson(result.response.text(), "object");

      if (parsed.overallScore !== undefined) {
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini evaluation error, using fresher evaluation engine:", err.message);
    }
  }

  // Fresher-calibrated fallback evaluation engine
  let totalLength = 0;
  let answeredCount = 0;
  const questionFeedback = [];

  questions.forEach((q, idx) => {
    const ans = (answers[idx] || "").trim();
    const words = ans ? ans.split(/\s+/).length : 0;
    totalLength += words;

    let qScore = 40;
    let feedback = "No answer provided—try sharing at least the core definition or a short example from a project.";

    if (words > 65) {
      qScore = 88;
      feedback = "Clear, well-explained entry-level response covering both the core concept and practical reasoning.";
      answeredCount++;
    } else if (words > 30) {
      qScore = 78;
      feedback = "Good grasp of the fundamentals; adding a quick code or project example would make this even stronger.";
      answeredCount++;
    } else if (words > 10) {
      qScore = 66;
      feedback = "Good starting point—try expanding on how it works step by step and one common edge case.";
      answeredCount++;
    }

    questionFeedback.push({
      id: q.id || idx + 1,
      score: qScore,
      feedback,
    });
  });

  const completionRatio = questions.length > 0 ? answeredCount / questions.length : 1;
  const avgWords = questions.length > 0 ? totalLength / questions.length : 0;

  const technicalScore = Math.min(94, Math.max(48, Math.round(54 + avgWords * 0.55)));
  const clarityScore = Math.min(95, Math.max(52, Math.round(58 + completionRatio * 32)));
  const overallScore = Math.round(technicalScore * 0.6 + clarityScore * 0.4);

  let rating = "Hire";
  let badgeVariant = "cyan";

  if (overallScore >= 86) {
    rating = "Strong Hire";
    badgeVariant = "emerald";
  } else if (overallScore >= 74) {
    rating = "Hire";
    badgeVariant = "cyan";
  } else if (overallScore >= 62) {
    rating = "Leaning Hire";
    badgeVariant = "amber";
  } else {
    rating = "Needs Work";
    badgeVariant = "rose";
  }

  return {
    overallScore,
    technicalScore,
    clarityScore,
    rating,
    badgeVariant,
    keyHighlights: `Showed encouraging foundational knowledge for an entry-level ${role} (${experienceLevel}) interview. Completed ${answeredCount} of ${questions.length} questions with structured reasoning.`,
    suggestedFollowups: "Practice pairing each concept with a concise example from a personal or coursework project, and mention basic error or edge-case checks.",
    strengths: [
      `Solid foundational understanding for a ${role} candidate`,
      "Clear, step-by-step communication style",
      "Good engagement across adaptive follow-up questions",
    ],
    improvements: [
      "Back up definitions with short, concrete project examples",
      "Briefly mention common mistakes or edge cases (e.g. empty inputs or failed requests)",
    ],
    questionFeedback,
  };
};
