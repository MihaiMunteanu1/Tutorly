import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// --- Types ---
interface Question {
  questionText: string;
  answers: string[];
  correctAnswerIndex: number;
}

interface QuizData {
  quizName: string;
  subject: string;
  questions: Question[];
}

export function QuizPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'input' | 'loading' | 'quiz' | 'result'>('input');
  const [description, setDescription] = useState('');
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnsIndex, setSelectedAnsIndex] = useState<number | null>(null);

  const generateQuiz = async () => {
    if (!description.trim()) return;
    setPhase('loading');

    try {
      const res = await fetch('https://avatar-server-gxmj.onrender.com/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) throw new Error("Generation error");

      const data = await res.json();
      setQuizData(data);
      setPhase('quiz');
      setCurrentQIndex(0);
      setScore(0);
    } catch (err) {
      alert("An error occurred. Please try again.");
      setPhase('input');
    }
  };

  const handleAnswerClick = (index: number) => {
    if (showFeedback) return;
    setSelectedAnsIndex(index);
    setShowFeedback(true);

    if (quizData && index === quizData.questions[currentQIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnsIndex(null);
    if (quizData && currentQIndex < quizData.questions.length - 1) {
      setCurrentQIndex(i => i + 1);
    } else {
      setPhase('result');
    }
  };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* --- GLOBAL STYLES --- */}
      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1) rotate(0deg); }
          to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); }
        }

        .glass-card {
          background: rgba(28, 28, 30, 0.4);
          backdrop-filter: blur(40px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 60px 50px;
          width: 100%;
          max-width: 700px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .elegant-entry { 
          opacity: 0; 
          animation: elegantEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          width: 100%;
        }
        
        /* Fix pentru culoarea formulelor KaTeX pe fundal întunecat */
        .katex {
            font-size: 1.1em;
            color: white !important;
        }
        .katex-display {
            margin: 10px 0;
        }

        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(20px); transform: scale(0.98) translateY(20px); }
          to { opacity: 1; filter: blur(0); transform: scale(1) translateY(0); }
        }

        /* Loading Pulse */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Blobs Background */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Back Button (Fixed Top Left) */}
      <div style={backButtonWrapper}>
        <button onClick={() => navigate("/mode")} style={backBtnStyle}>
          ← Back
        </button>
      </div>

      <div style={contentWrapper}>

        {/* PHASE 1: INPUT */}
        {phase === 'input' && (
          <div className="glass-card elegant-entry">
            <div style={iconCircle}>🧠</div>
            <h1 style={titleStyle}>AI Knowledge Check</h1>
            <p style={subtitleStyle}>What topic do you want to master today?</p>

            <textarea
              style={premiumTextarea}
              placeholder="Ex: Calculus basics, The History of Rome, React Hooks..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <button onClick={generateQuiz} style={primaryBtnStyle}>
              Generate Quiz
            </button>
          </div>
        )}

        {/* PHASE 2: LOADING */}
        {phase === 'loading' && (
          <div className="elegant-entry" style={{ textAlign: 'center' }}>
            <div style={{ ...iconCircle, animation: 'pulse 1.5s infinite', margin: '0 auto 24px auto' }}>⚙️</div>
            <h2 style={titleStyle}>Crafting your quiz...</h2>
            <p style={subtitleStyle}>Analyzing the subject and generating questions.</p>
          </div>
        )}

        {/* PHASE 3: ACTIVE QUIZ */}
        {phase === 'quiz' && quizData && (
            <div className="glass-card elegant-entry">
              <div style={headerRow}>
                <span style={badgeStyle}>{quizData.subject}</span>
                <span style={progressStyle}>Question {currentQIndex + 1} / {quizData.questions.length}</span>
              </div>

              <div style={questionContainer}>
                {/* Folosim ReactMarkdown pentru a randa LaTeX și formatare */}
                <ReactMarkdown
                    children={quizData.questions[currentQIndex].questionText}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      // Personalizăm tag-ul <p> ca să aibă stilul nostru de titlu
                      p: ({node, ...props}) => <h3 style={questionTextStyle} {...props} />
                    }}
                />
              </div>

              <div style={gridOptions}>
                {quizData.questions[currentQIndex].answers.map((ans, idx) => {
                  let borderColor = 'rgba(255, 255, 255, 0.1)';
                  let btnBg = 'rgba(255,255,255,0.03)';

                  if (showFeedback) {
                    if (idx === quizData.questions[currentQIndex].correctAnswerIndex) {
                      borderColor = '#4caf50'; // Green
                      btnBg = 'rgba(76, 175, 80, 0.2)';
                    } else if (idx === selectedAnsIndex) {
                      borderColor = '#ef4444'; // Red
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                    }
                  }

                  return (
                      <button
                          key={idx}
                          className="option-btn"
                          onClick={() => handleAnswerClick(idx)}
                          disabled={showFeedback}
                          style={{
                              ...optionBtnStyle,
                              backgroundColor: btnBg,
                              borderColor: borderColor,
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              opacity: showFeedback && idx !== quizData.questions[currentQIndex].correctAnswerIndex && idx !== selectedAnsIndex ? 0.5 : 1
                          }}
                      >
                        <span style={optionLetter}>{String.fromCharCode(65 + idx)}</span>

                        {/* Randare Markdown și în buton */}
                        <div style={{pointerEvents: 'none', width: '100%'}}>
                          <ReactMarkdown
                              children={ans}
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                p: ({node, ...props}) => <span {...props} />
                              }}
                          />
                        </div>
                      </button>
                  );
                })}
              </div>

              {showFeedback && (
                  <button onClick={nextQuestion}
                          style={{...primaryBtnStyle, marginTop: '30px', width: 'auto', padding: '14px 40px'}}>
                    {currentQIndex === quizData.questions.length - 1 ? "See Results" : "Next Question →"}
                  </button>
              )}
            </div>
        )}

        {/* PHASE 4: RESULT */}
        {phase === 'result' && quizData && (
            <div className="glass-card elegant-entry">
              <div style={iconCircle}>🏆</div>
              <h1 style={titleStyle}>Quiz Completed!</h1>
              <p style={subtitleStyle}>You have finished the <strong>{quizData.subject}</strong> test.</p>

              <div style={scoreBox}>
                <span style={{
                  fontSize: '14px',
                  color: '#6e7681',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '10px'
                }}>Your Score</span>
                <div style={{ fontSize: '64px', fontWeight: 800, color: '#fff' }}>
                    {score}<span style={{fontSize: '32px', color: '#6e7681'}}>/{quizData.questions.length}</span>
                </div>
              </div>

            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
              <button onClick={() => navigate('/mode')} style={{ ...secondaryBtnStyle, flex: 1 }}>Exit</button>
              <button onClick={() => setPhase('input')} style={{ ...primaryBtnStyle, flex: 1, marginTop: 0 }}>Try New Topic</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---

const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", position: 'relative', overflow: 'hidden' };
const contentWrapper: React.CSSProperties = { zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '20px' };

const backButtonWrapper: React.CSSProperties = { position: 'absolute', top: '40px', left: '40px', zIndex: 10 };
const backBtnStyle: React.CSSProperties = { padding: "10px 24px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'background 0.3s' };

const iconCircle: React.CSSProperties = { width: "80px", height: "80px", borderRadius: "30px", background: 'rgba(53, 114, 239, 0.1)', color: '#3572ef', display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "24px" };

const titleStyle: React.CSSProperties = { fontSize: "36px", fontWeight: 800, color: "#fff", margin: "0 0 12px 0", letterSpacing: "-0.02em" };
const subtitleStyle: React.CSSProperties = { fontSize: "16px", color: "#8b949e", margin: "0 0 32px 0", lineHeight: 1.5, maxWidth: '400px' };

const premiumTextarea: React.CSSProperties = {
  width: '100%', height: '120px',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px',
  color: 'white',
  padding: '20px',
  fontSize: '16px',
  resize: 'none',
  outline: 'none',
  marginBottom: '24px',
  transition: 'border-color 0.3s'
};

const primaryBtnStyle: React.CSSProperties = {
  width: '100%', padding: '16px',
  background: '#3572ef',
  color: 'white',
  border: 'none',
  borderRadius: '16px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '16px',
  marginTop: '10px',
  transition: 'transform 0.2s',
  boxShadow: '0 4px 20px rgba(53, 114, 239, 0.4)'
};

const secondaryBtnStyle: React.CSSProperties = {
  ...primaryBtnStyle,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none'
};

/* Quiz Specific Styles */
const headerRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '30px' };
const badgeStyle: React.CSSProperties = { padding: "6px 12px", borderRadius: "8px", background: 'rgba(53, 114, 239, 0.1)', color: "#3572ef", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" };
const progressStyle: React.CSSProperties = { fontSize: '14px', color: '#6e7681', fontWeight: 600 };

const questionContainer: React.CSSProperties = { marginBottom: '30px', width: '100%' };
const questionTextStyle: React.CSSProperties = { fontSize: "24px", fontWeight: 700, color: "#fff", margin: "0", lineHeight: 1.4 };

const gridOptions: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' };
const optionBtnStyle: React.CSSProperties = {
  padding: '20px',
  borderRadius: '16px',
  color: '#e6edf3',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '15px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  lineHeight: 1.4,
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const optionLetter: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%', fontWeight: 700, fontSize: '14px', flexShrink: 0
};

const scoreBox: React.CSSProperties = { background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '30px', width: '100%', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' };