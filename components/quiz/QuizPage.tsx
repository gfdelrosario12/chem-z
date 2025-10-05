"use client";

import React, { useEffect, useState } from "react";

type QuizProps = {
  activityId: number;
  unit: 1 | 2;
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  feedback: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const MAX_RETRIES = 3;

// QUIZ DATA
const quizzes: Record<number, Question[]> = {
  1: [
    {
      question: "Which statement is NOT part of the Kinetic Molecular Theory (KMT)?",
      options: [
        "Particles are in constant motion",
        "The average kinetic energy depends on temperature",
        "Particles are always at rest in solids",
        "Particles have negligible volume compared to their container",
      ],
      correctAnswer: "Particles are always at rest in solids",
      feedback: `KMT states that particles are always in motion, even in solids (they vibrate in place). Saying particles are at rest is incorrect.`,
    },
    {
      question: "Which type of intermolecular force is present in all substances?",
      options: ["Dipole-dipole forces", "Hydrogen bonding", "London dispersion forces", "Ionic bonds"],
      correctAnswer: "London dispersion forces",
      feedback: `London dispersion forces are temporary attractions that exist in all substances, even nonpolar ones.`,
    },
    {
      question: "Which property is unique to liquids compared to solids and gases?",
      options: [
        "Definite shape and volume",
        "Definite volume but no definite shape",
        "No definite volume or shape",
        "High compressibility",
      ],
      correctAnswer: "Definite volume but no definite shape",
      feedback: `Liquids keep a fixed volume but take the shape of their container.`,
    },
    {
      question: "Which factor increases the rate of evaporation of a liquid?",
      options: [
        "Decreasing surface area",
        "Increasing temperature",
        "Increasing humidity",
        "Stronger intermolecular forces",
      ],
      correctAnswer: "Increasing temperature",
      feedback: `Higher temperature gives particles more energy to escape the liquid surface.`,
    },
    {
      question: "Which type of solid has particles arranged in a repeating geometric pattern?",
      options: ["Amorphous solid", "Crystalline solid", "Liquid crystal", "Gas solid"],
      correctAnswer: "Crystalline solid",
      feedback: `Crystalline solids have an ordered, repeating structure (like salt or quartz).`,
    },
    {
      question: "What is an example of an amorphous solid?",
      options: ["Ice", "Diamond", "Glass", "Quartz"],
      correctAnswer: "Glass",
      feedback: `Glass lacks a regular geometric arrangement of its particles, making it amorphous.`,
    },
    {
      question: "Which term describes a change from solid directly to gas?",
      options: ["Melting", "Sublimation", "Condensation", "Deposition"],
      correctAnswer: "Sublimation",
      feedback: `Sublimation is the direct transition from solid to gas (e.g., dry ice → CO₂ gas).`,
    },
    {
      question: "When water vapor changes into liquid water, the process is called:",
      options: ["Melting", "Evaporation", "Condensation", "Freezing"],
      correctAnswer: "Condensation",
      feedback: `Condensation is gas turning into liquid.`,
    },
    {
      question: "During a phase change, the temperature of a substance:",
      options: [
        "Increases steadily",
        "Decreases steadily",
        "Remains constant until the change is complete",
        "Changes randomly",
      ],
      correctAnswer: "Remains constant until the change is complete",
      feedback: `Heat energy goes into breaking/forming intermolecular forces, not changing temperature, during a phase change.`,
    },
    {
      question: "Which phase change requires the most energy input?",
      options: ["Freezing", "Condensation", "Vaporization", "Melting"],
      correctAnswer: "Vaporization",
      feedback: `Vaporization requires breaking most intermolecular forces to go from liquid to gas, so it needs the most energy.`,
    },
  ],
  2: [
    {
      question: "Which of the following will generally increase the solubility of most solid solutes in water?",
      options: [
        "Lowering the temperature",
        "Increasing the temperature",
        "Decreasing pressure",
        "Using a nonpolar solvent",
      ],
      correctAnswer: "Increasing the temperature",
      feedback: "Most solid solutes dissolve better at higher temperatures because increased kinetic energy allows particles to break apart and interact with the solvent more easily.",
    },
    {
      question: "Which term describes a solution that contains more dissolved solute than it normally would at a given temperature?",
      options: ["Saturated", "Supersaturated", "Unsaturated", "Dilute"],
      correctAnswer: "Supersaturated",
      feedback: "A supersaturated solution has more solute dissolved than equilibrium normally allows, usually formed by heating and then cooling carefully.",
    },
    {
      question: "What is the molarity of a solution that contains 2 moles of solute in 4 liters of solution?",
      options: ["0.25 M", "0.5 M", "2 M", "8 M"],
      correctAnswer: "0.5 M",
      feedback: "Molarity = moles ÷ liters = 2 ÷ 4 = 0.5 M.",
    },
    {
      question: "Which factor has the greatest effect on the solubility of a gas in a liquid?",
      options: ["Temperature", "Pressure", "Stirring", "Polarity"],
      correctAnswer: "Pressure",
      feedback: "According to Henry’s Law, higher pressure increases gas solubility in a liquid.",
    },
    {
      question: "A solution that contains less solute than it can hold at a given temperature is called:",
      options: ["Saturated", "Supersaturated", "Unsaturated", "Concentrated"],
      correctAnswer: "Unsaturated",
      feedback: "Unsaturated solutions can still dissolve more solute.",
    },
    {
      question: "If 58.44 g of NaCl is dissolved in enough water to make 1.00 L of solution, what is the molarity?",
      options: ["0.5 M", "1.0 M", "2.0 M", "3.0 M"],
      correctAnswer: "1.0 M",
      feedback: "Molar mass of NaCl = 23 + 35.45 = 58.45 g/mol. 58.44 g is ~1 mole. 1 mole ÷ 1 L = 1.0 M.",
    },
    {
      question: "Which of the following will NOT increase the rate at which a solid dissolves in a liquid?",
      options: [
        "Stirring the solution",
        "Increasing the temperature",
        "Increasing the surface area of the solute",
        "Using a larger container without stirring",
      ],
      correctAnswer: "Using a larger container without stirring",
      feedback: "Container size doesn’t affect dissolving rate. Stirring, heating, and increasing surface area all speed up dissolution.",
    },
    {
      question: "Which type of solution has water as the solvent?",
      options: ["Aqueous", "Saturated", "Supersaturated", "Concentrated"],
      correctAnswer: "Aqueous",
      feedback: '"Aqueous" means water is the solvent.',
    },
    {
      question: "What is the percentage by mass of NaOH in a solution containing 10 g NaOH in 90 g of water?",
      options: ["10%", "11.1%", "9%", "12%"],
      correctAnswer: "11.1%",
      feedback: "% by mass = (solute ÷ total mass) × 100 = (10 ÷ (10+90)) × 100 = 11.1%",
    },
    {
      question: "Which factor increases gas solubility in a liquid?",
      options: [
        "Increasing temperature and decreasing pressure",
        "Increasing temperature and pressure",
        "Decreasing temperature and increasing pressure",
        "Decreasing temperature and pressure",
      ],
      correctAnswer: "Decreasing temperature and increasing pressure",
      feedback: "Lower temperature and higher pressure both help gases stay dissolved in liquids.",
    },
  ],
};

const QuizPage: React.FC<QuizProps> = ({ activityId, unit }) => {
  const [answers, setAnswers] = useState<string[]>(Array(quizzes[unit].length).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState<number>(0);
  const [blocked, setBlocked] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);

  // Load studentId from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedId = localStorage.getItem("userId");
    if (!storedId) {
      setError("No student ID found. Please login first.");
      return;
    }
    setStudentId(Number(storedId));
    console.log("Loaded studentId from localStorage:", storedId);
  }, []);

  // Fetch retries for this activity and student
  useEffect(() => {
    if (studentId === null) return;
    const fetchRetries = async () => {
      try {
        const res = await fetch(`${API_BASE}/activities/${activityId}/retries/${studentId}`);
        if (!res.ok) throw new Error("Failed to fetch retries");
        const data = await res.json();
        setRetries(data);
        setBlocked(data >= MAX_RETRIES);
      } catch (err: any) {
        setError(err.message || "Failed to load retries");
      }
    };
    fetchRetries();
  }, [activityId, studentId]);

  const handleSelect = (idx: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (blocked || studentId === null) return;

    const calculatedScore = quizzes[unit].reduce(
      (total, q, idx) => total + (answers[idx] === q.correctAnswer ? 10 : 0),
      0
    );
    setScore(calculatedScore);
    setLoading(true);
    setError(null);

    try {
      // Save score
      const scoreRes = await fetch(
        `${API_BASE}/activities/${activityId}/score/${studentId}?score=${calculatedScore}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // This tells the server to expect JSON (even an empty one)
          },
        }
      );
      if (!scoreRes.ok) throw new Error(`Failed to save score: ${scoreRes.status}`);

      // Increment retries
      const retriesRes = await fetch(
        `${API_BASE}/activities/${activityId}/retries/${studentId}`,
        { method: "PATCH" }
      );
      if (!retriesRes.ok) throw new Error(`Failed to update retries: ${retriesRes.status}`);
      const retriesData = await retriesRes.json();

      setRetries(retriesData.retries);
      setBlocked(retriesData.retries >= MAX_RETRIES);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong while submitting the quiz");
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <div className="p-8 bg-gray-100 rounded-lg shadow-md max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚫 Quiz Locked</h2>
        <p className="text-gray-700 text-lg">
          You have exceeded the maximum number of retries (3). You cannot access this quiz anymore.
        </p>
      </div>
    );
  }

  if (!submitted) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-4">UNIT {unit} QUIZ</h2>
        <p className="text-white bg-gray-600 inline-block px-2 py-1 rounded text-sm mb-4">
          Retries used: <span className="font-semibold">{retries}</span> / 3
        </p>

        {quizzes[unit].map((q, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-200">
            <p className="font-semibold mb-3 text-gray-800">{idx + 1}. {q.question}</p>
            <ul className="space-y-2">
              {q.options.map((opt, i) => (
                <li key={i}>
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={opt}
                      checked={answers[idx] === opt}
                      onChange={() => handleSelect(idx, opt)}
                      className="accent-gray-600 w-5 h-5"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gray-700 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  // Feedback view
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">📑 UNIT {unit} QUIZ – FEEDBACK</h2>
      <p className="italic text-gray-600">
        You scored <strong>{score}</strong> out of {quizzes[unit].length * 10} points.
      </p>

      {quizzes[unit].map((q, idx) => (
        <div key={idx} className="bg-white p-4 rounded-lg shadow">
          <p className="font-semibold mb-2 text-gray-800">{idx + 1}. {q.question}</p>
          <p>
            Your answer:{" "}
            <span
              className={
                answers[idx] === q.correctAnswer
                  ? "text-gray-700 font-semibold"
                  : "text-gray-500 font-semibold line-through"
              }
            >
              {answers[idx] || "No answer"} {answers[idx] === q.correctAnswer ? "✅" : "❌"}
            </span>
          </p>
          <p>Correct answer: <span className="font-semibold text-gray-800">{q.correctAnswer}</span></p>
          <p className="text-gray-600 mt-1">Explanation: {q.feedback}</p>
        </div>
      ))}

      <p className="text-sm text-gray-500 mt-4">
        📌 Review the concepts to improve your understanding for future quizzes.
      </p>
    </div>
  );
};

export default QuizPage;