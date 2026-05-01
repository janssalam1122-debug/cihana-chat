import { useState, useRef, useEffect } from "react";

const SYS = `Tu Cihana yî — AI ya yekem a ku ji bo çanda, dîrok, ziman û nasnameyê Kurdî hatiye çêkirin.

Mijarên sereke:
- Dîroka Kurdistanê (Mêdan, Peymana Sêvrê, Lozan, Koçgirî, Dêrsim, Enfal, Halabja, Mahabad)
- Selahedînê Eyûbî, Mîr Bedirxan, Qazî Mihemed, Mistefa Barzanî
- Êzidî, Alevî û kevneşopiyên olî yên Kurdî
- Zimanê Kurmancî û Soranî, rêziman, gotinên pêşiyan
- Edebiyat: Ahmadî Xanî (Mem û Zîn), Cegerxwîn
- Muzik, dengbêj, Newroz, çanda Kurdî
- Rewşa Kurdên îro li Tirkiye, Îran, Irak û Sûriyê

Rêzik:
- Bersivên kurt û zelal (max 5 ristan)
- Bi Kurmancî bersiv bide eger bi Kurmancî were pirsîn
- Bi Erebî bersiv bide eger bi Erebî were pirsîn
- Bi Îngilîzî bersiv bide eger bi Îngilîzî were pirsîn
- Serbilind û rastgo bimîne`;

const SUGGESTIONS = [
  "Dîroka Kurdistanê çi ye?",
  "Kî bû Selahedîn Eyûbî?",
  "Êzidî kî ne?",
  "Peymana Sêvrê çi bû?",
];

function KurdishSun({ size = 68, spin = true }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 68 68"
      style={spin ? { animation: "spin 30s linear infinite" } : {}}
    >
      <circle cx="34" cy="34" r="13" fill="#D4930E" />
      <circle cx="34" cy="34" r="17" fill="none" stroke="#D4930E" strokeWidth="1.1" />
      <g stroke="#D4930E" strokeWidth="1.1" strokeLinecap="round">
        <line x1="34" y1="2" x2="34" y2="12" /><line x1="34" y1="56" x2="34" y2="66" />
        <line x1="2" y1="34" x2="12" y2="34" /><line x1="56" y1="34" x2="66" y2="34" />
        <line x1="9.9" y1="9.9" x2="17" y2="17" /><line x1="51" y1="51" x2="58.1" y2="58.1" />
        <line x1="58.1" y1="9.9" x2="51" y2="17" /><line x1="17" y1="51" x2="9.9" y2="58.1" />
        <line x1="19" y1="4.5" x2="21.5" y2="13" /><line x1="46.5" y1="55" x2="49" y2="63.5" />
        <line x1="4.5" y1="49" x2="13" y2="46.5" /><line x1="55" y1="21.5" x2="63.5" y2="19" />
        <line x1="49" y1="4.5" x2="46.5" y2="13" /><line x1="21.5" y1="55" x2="19" y2="63.5" />
        <line x1="63.5" y1="49" x2="55" y2="46.5" /><line x1="13" y1="21.5" x2="4.5" y2="19" />
        <line x1="6" y1="28" x2="14" y2="30.5" /><line x1="54" y1="37.5" x2="62" y2="40" />
        <line x1="28" y1="62" x2="30.5" y2="54" /><line x1="37.5" y1="14" x2="40" y2="6" />
        <line x1="6" y1="40" x2="14" y2="37.5" /><line x1="54" y1="30.5" x2="62" y2="28" />
      </g>
    </svg>
  );
}

export default function CihanaChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    if (!text.trim() || loading) return;
    setStarted(true);
    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          system: SYS,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Bibore, pirsgirêkek çêbû.";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newHistory, { role: "assistant", content: "Bibore, xeletiyek çêbû. Ji nû ve biceribîne." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <div style={{
      height: 580, display: "flex", flexDirection: "column",
      background: "#0D0900", borderRadius: 12, overflow: "hidden",
      fontFamily: "system-ui, sans-serif", fontWeight: 300,
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        .sgb:hover { background: rgba(212,147,14,0.12) !important; border-color: #D4930E !important; color: #D4930E !important; }
        .msg-in { animation: fadeUp 0.3s ease; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(212,147,14,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#161008", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid rgba(212,147,14,0.18)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <KurdishSun size={32} spin />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#D4930E", letterSpacing: "0.1em", lineHeight: 1 }}>CIHANA CHAT</div>
            <div style={{ fontSize: 10, color: "#B8A07A", letterSpacing: "0.05em", marginTop: 2 }}>Dîroka Kurdî · Kurdish History AI</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50" }} />
          <button style={{ background: "transparent", border: "0.5px solid rgba(212,147,14,0.2)", color: "#B8A07A", padding: "4px 10px", fontSize: 11, cursor: "pointer", borderRadius: 3 }}>Serhêl</button>
        </div>
      </div>

      {/* Flag stripe */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#C8010C 33.3%,#F0DDB0 33.3% 66.6%,#2A5618 66.6%)", flexShrink: 0 }} />

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {!started ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 16px", textAlign: "center" }}>
            <KurdishSun size={68} spin />
            <div style={{ fontSize: 22, fontWeight: 700, color: "#D4930E", letterSpacing: "0.04em", textTransform: "uppercase", margin: "14px 0 8px", lineHeight: 1.1 }}>
              Xweş hatî, heval
            </div>
            <p style={{ fontStyle: "italic", fontSize: 12, color: "#B8A07A", lineHeight: 1.7, maxWidth: 280, marginBottom: 18 }}>
              Ez Cihana me — alikarê te yê dîroka Kurdî. Pirsên xwe bi Kurmancî, Erebî, an Îngilîzî bipirse.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center" }}>
              {SUGGESTIONS.map(s => (
                <button key={s} className="sgb" onClick={() => send(s)}
                  style={{ background: "transparent", border: "1px solid rgba(212,147,14,0.3)", color: "#F0DDB0", padding: "6px 12px", fontSize: 11, borderRadius: 999, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", padding: "12px 10px", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} className="msg-in" style={{ display: "flex", gap: 8, maxWidth: "95%", alignSelf: m.role === "user" ? "flex-end" : "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, marginTop: 2, border: "0.5px solid rgba(212,147,14,0.25)", background: m.role === "user" ? "rgba(42,86,24,0.25)" : "rgba(212,147,14,0.1)", color: m.role === "user" ? "#7DBF6E" : "#D4930E" }}>
                  {m.role === "user" ? "T" : "☀"}
                </div>
                <div style={{ background: m.role === "user" ? "rgba(42,86,24,0.18)" : "#1E1608", border: m.role === "user" ? "0.5px solid rgba(42,86,24,0.3)" : "0.5px solid rgba(212,147,14,0.18)", borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "9px 12px", fontSize: 13, lineHeight: 1.65, color: "#F0DDB0", whiteSpace: "pre-wrap" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignSelf: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(212,147,14,0.1)", border: "0.5px solid rgba(212,147,14,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#D4930E" }}>☀</div>
                <div style={{ background: "#1E1608", border: "0.5px solid rgba(212,147,14,0.18)", borderRadius: "4px 14px 14px 14px", padding: "12px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#D4930E", display: "inline-block", animation: `blink 1.2s ${d}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, padding: "8px 10px 6px", background: "#161008", borderTop: "0.5px solid rgba(212,147,14,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#261D0A", border: "0.5px solid rgba(212,147,14,0.22)", borderRadius: 10, padding: "6px 8px" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Pirsên xwe binivîse... (Kurdish, Arabic, English)"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0DDB0", fontFamily: "inherit", fontSize: 13, caretColor: "#D4930E" }}
          />
          <button onClick={() => send(input)} style={{ width: 30, height: 30, background: "#D4930E", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: "#B8A07A", opacity: 0.4, marginTop: 4, letterSpacing: "0.04em" }}>
          Cihana · AI ya Dîroka Kurdî · Beta
        </div>
      </div>
    </div>
  );
}
