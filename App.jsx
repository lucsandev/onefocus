import { useState, useRef, useEffect } from "react";

const LOADING_MESSAGES = [
  "Reading your thoughts…",
  "Finding what matters…",
  "Sorting through the noise…",
  "Almost there…",
];

function formatResult(text) {
  return text.split("\n").filter(Boolean).map((para, i) => {
    const parts = para.split(/(\*[^*]+\*)/g).map((segment, j) => {
      if (segment.startsWith("*") && segment.endsWith("*")) {
        return <em key={j}>{segment.slice(1, -1)}</em>;
      }
      return segment;
    });
    return (
      <p key={i} style={{
        marginBottom: "1.4em",
        opacity: 0,
        animation: `fadeUp 0.6s ease ${0.15 * i}s forwards`,
      }}>{parts}</p>
    );
  });
}

export default function OneFocus() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [phase, setPhase] = useState("input");
  const [loadingText, setLoadingText] = useState("");
  const textareaRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (phase === "loading") {
      let i = 0;
      setLoadingText(LOADING_MESSAGES[0]);
      const interval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingText(LOADING_MESSAGES[i]);
      }, 2200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "input" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "result" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setPhase("loading");
    setResult("");

    try {
      const response = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input }),
      });

      const data = await response.json();

      if (data.error) {
        setResult("Something went wrong. Please try again in a moment.");
      } else {
        setResult(data.result);
      }
      setPhase("result");
    } catch (err) {
      console.error(err);
      setResult("Couldn't connect right now. Please try again in a moment.");
      setPhase("result");
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setInput("");
    setResult("");
    setPhase("input");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#DDDACD",
      fontFamily: "'Playfair Display', 'Georgia', serif",
      color: "#2C2B28",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        textarea::placeholder {
          color: #9C9A90;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 16px;
        }

        textarea:focus { outline: none; }

        .submit-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #2C2B28;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .submit-btn:hover {
          background: #C4A95B;
          transform: scale(1.05);
        }
        .submit-btn:active { transform: scale(0.95); }
        .submit-btn:disabled {
          opacity: 0.3;
          cursor: default;
          transform: none;
        }
        .submit-btn:disabled:hover {
          background: #2C2B28;
          transform: none;
        }

        .reset-btn {
          background: none;
          border: 1px solid #2C2B2833;
          color: #2C2B28;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 14px;
          padding: 10px 24px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .reset-btn:hover {
          border-color: #2C2B28;
          background: #2C2B28;
          color: #DDDACD;
        }

        .coffee-link {
          color: #2C2B28;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: #2C2B2855;
          transition: text-decoration-color 0.2s;
          font-style: italic;
        }
        .coffee-link:hover {
          text-decoration-color: #C4A95B;
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "fadeUp 0.5s ease forwards",
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#C4A95B",
        }} />
        <span style={{
          fontSize: "15px",
          fontStyle: "italic",
          letterSpacing: "0.02em",
          opacity: phase === "input" ? 1 : 0.5,
          transition: "opacity 0.4s",
          cursor: phase !== "input" ? "pointer" : "default",
        }} onClick={phase !== "input" ? handleReset : undefined}>
          One Focus
        </span>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: phase === "input" ? "center" : "flex-start",
        padding: "0 24px",
        paddingBottom: "120px",
        transition: "all 0.5s ease",
      }}>

        {/* INPUT */}
        {phase === "input" && (
          <div style={{
            width: "100%",
            maxWidth: "640px",
            animation: "fadeUp 0.6s ease forwards",
          }}>
            <h1 style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 400,
              textAlign: "center",
              marginBottom: "32px",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}>
              What's on your mind today?
            </h1>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#FFFEF9",
              borderRadius: "100px",
              padding: "8px 8px 8px 24px",
              boxShadow: "0 1px 8px rgba(44,43,40,0.06)",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write everything down. Don't think. Just type."
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
                }}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#2C2B28",
                  resize: "none",
                  minHeight: "28px",
                  maxHeight: "200px",
                  overflow: "auto",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                }}
              />
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
                aria-label="Find what matters"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 9H14.5M14.5 9L9.5 4M14.5 9L9.5 14" stroke="#FFFEF9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <p style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#9C9A90",
              marginTop: "14px",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "0.02em",
            }}>
              <kbd style={{
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #2C2B2820",
                fontSize: "11px",
                fontFamily: "system-ui, sans-serif",
              }}>⌘</kbd>
              {" "}
              <kbd style={{
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #2C2B2820",
                fontSize: "11px",
                fontFamily: "system-ui, sans-serif",
              }}>↵</kbd>
              {" "}to submit
            </p>
          </div>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            minHeight: "60vh",
            animation: "fadeUp 0.4s ease forwards",
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#C4A95B",
              animation: "breathe 2s ease-in-out infinite",
            }} />
            <p style={{
              fontSize: "16px",
              fontStyle: "italic",
              color: "#7A786E",
            }}>
              {loadingText}
            </p>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <div ref={resultRef} style={{
            width: "100%",
            maxWidth: "580px",
            paddingTop: "clamp(40px, 10vh, 80px)",
          }}>
            <div style={{
              marginBottom: "40px",
              padding: "16px 20px",
              backgroundColor: "#D5D2C5",
              borderRadius: "16px",
              animation: "fadeUp 0.5s ease forwards",
            }}>
              <p style={{
                fontSize: "13px",
                color: "#7A786E",
                fontStyle: "italic",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {input}
              </p>
            </div>

            <div style={{
              fontSize: "17px",
              lineHeight: 1.75,
              color: "#2C2B28",
              letterSpacing: "0.01em",
            }}>
              {formatResult(result)}
            </div>

            <div style={{
              marginTop: "48px",
              textAlign: "center",
              opacity: 0,
              animation: "fadeUp 0.5s ease 1s forwards",
            }}>
              <button className="reset-btn" onClick={handleReset}>
                Start fresh
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "20px",
        textAlign: "center",
        fontSize: "13px",
        color: "#9C9A90",
        fontStyle: "italic",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: "#DDDACDE6",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#C4A95B",
        }} />
        <span>Made by one person. <a href="#" className="coffee-link">Buy them a coffee?</a></span>
      </footer>
    </div>
  );
}
