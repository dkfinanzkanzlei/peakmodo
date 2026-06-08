import { useState, useEffect, useRef } from "react";

/* ── STORAGE ── */
const KEY = "peakmodo_tasks_v1";
const load = () => { try { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : null; } catch { return null; } };
const persist = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };

/* ── COLORS ── */
const G = {
  gold: "#C9A84C", gl: "#F5D078", gd: "#8B6914",
  grad: "linear-gradient(135deg,#F5D078,#C9A84C,#8B6914)",
  gradV: "linear-gradient(180deg,#F5D078 0%,#C9A04C 60%,#8B6914 100%)",
  bg: "rgba(201,168,76,.08)", border: "rgba(201,168,76,.2)",
};

const PRIO = {
  urgent:  { label: "Dringend",        color: "#EF4444", bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.25)",   icon: "🔴", sort: 0 },
  important:{ label: "Wichtig",        color: "#F97316", bg: "rgba(249,115,22,.1)",  border: "rgba(249,115,22,.25)",  icon: "🟡", sort: 1 },
  soon:    { label: "Bald erledigen",  color: "#C9A84C", bg: "rgba(201,168,76,.1)",  border: "rgba(201,168,76,.25)",  icon: "🟤", sort: 2 },
  someday: { label: "Irgendwann",      color: "#6B7280", bg: "rgba(107,114,128,.1)", border: "rgba(107,114,128,.2)",  icon: "⚪", sort: 3 },
};

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const TODAY = () => new Date().toDateString();

/* ── SEED ── */
const SEED = () => ({ tasks: [], chat: [], lastReminder: "" });

/* ── MENTOR AVATAR SVG ── */
function MentorAvatar({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, borderRadius: size * .25, border: `1px solid ${G.border}` }}>
      <rect width="100" height="100" fill="#1A1400" rx={size*.25}/>
      <ellipse cx="50" cy="88" rx="28" ry="18" fill="#2A1F00"/>
      <rect x="24" y="68" width="52" height="24" rx="8" fill="#2A1F00"/>
      <rect x="47" y="68" width="6" height="24" fill="#C9A84C" opacity="0.6"/>
      <rect x="24" y="68" width="52" height="4" rx="2" fill="#C9A84C" opacity="0.5"/>
      <rect x="44" y="60" width="12" height="12" rx="4" fill="#D4956A"/>
      <ellipse cx="50" cy="46" rx="20" ry="22" fill="#D4956A"/>
      <ellipse cx="50" cy="27" rx="20" ry="10" fill="#3A3028"/>
      <ellipse cx="50" cy="26" rx="18" ry="8" fill="#4A4038"/>
      <ellipse cx="38" cy="38" rx="7" ry="2.5" fill="#5A4A30" transform="rotate(-8 38 38)"/>
      <ellipse cx="62" cy="38" rx="7" ry="2.5" fill="#5A4A30" transform="rotate(8 62 38)"/>
      <ellipse cx="38" cy="44" rx="4" ry="3.5" fill="#1A1000"/>
      <ellipse cx="62" cy="44" rx="4" ry="3.5" fill="#1A1000"/>
      <circle cx="39" cy="43" r="1.2" fill="white" opacity="0.8"/>
      <circle cx="63" cy="43" r="1.2" fill="white" opacity="0.8"/>
      <ellipse cx="50" cy="50" rx="3" ry="2" fill="#BF8060"/>
      <ellipse cx="50" cy="64" rx="18" ry="12" fill="#E8DCC8"/>
      <ellipse cx="50" cy="60" rx="14" ry="8" fill="#F0E8D8"/>
      <line x1="44" y1="57" x2="42" y2="72" stroke="#C8B898" strokeWidth="1.5" opacity="0.7"/>
      <line x1="50" y1="56" x2="50" y2="74" stroke="#C8B898" strokeWidth="1.5" opacity="0.7"/>
      <line x1="56" y1="57" x2="58" y2="72" stroke="#C8B898" strokeWidth="1.5" opacity="0.7"/>
      <ellipse cx="46" cy="54" rx="6" ry="2.5" fill="#9A8870"/>
      <ellipse cx="54" cy="54" rx="6" ry="2.5" fill="#9A8870"/>
      <path d="M 44 57 Q 50 61 56 57" stroke="#9A7060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <text x="50" y="86" textAnchor="middle" fontSize="10" fill="#C9A84C" opacity="0.8">✦</text>
    </svg>
  );
}

/* ── TOAST ── */
function Toast({ msg, on }) {
  return (
    <div style={{ position:"fixed", bottom:80, left:"50%", transform:`translateX(-50%) translateY(${on?0:12}px)`, opacity:on?1:0, transition:"all .3s ease", background:"#111", border:`1px solid ${G.border}`, color:G.gold, padding:"10px 22px", borderRadius:100, fontSize:13, fontWeight:700, letterSpacing:.3, whiteSpace:"nowrap", zIndex:8000, pointerEvents:"none" }}>{msg}</div>
  );
}

/* ── TASK CARD ── */
function TaskCard({ task, onToggle, onDelete }) {
  const p = PRIO[task.priority] || PRIO.soon;
  const [pressed, setPressed] = useState(false);
  return (
    <div className="task-card" style={{ background: task.done ? "rgba(255,255,255,.02)" : p.bg, border: `1px solid ${task.done ? "rgba(255,255,255,.05)" : p.border}`, borderRadius: 14, padding: "13px 14px", display: "flex", gap: 12, alignItems: "flex-start", transition: "all .25s", opacity: task.done ? .5 : 1, animation: "fadeUp .3s ease both" }}>
      {/* Checkbox */}
      <button onClick={() => onToggle(task.id)} style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${task.done ? G.gold : p.color}`, background: task.done ? G.bg : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: G.gold, transition: "all .2s", marginTop: 1 }}>
        {task.done ? "✓" : ""}
      </button>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: task.done ? "#555" : "#E8EAF6", textDecoration: task.done ? "line-through" : "none", lineHeight: 1.4 }}>{task.title}</div>
        {task.note && <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.4 }}>{task.note}</div>}
        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .5, padding: "2px 8px", borderRadius: 20, background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>{p.icon} {p.label}</span>
          {task.deadline && <span style={{ fontSize: 10, color: "#555" }}>📅 {task.deadline}</span>}
        </div>
      </div>
      {/* Delete */}
      <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 16, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN APP
══════════════════════════════════════ */
export default function PeakmodoTasks() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("tasks"); // tasks | chat | add
  const [input, setInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", on: false });
  const [filter, setFilter] = useState("all");
  const [addForm, setAddForm] = useState({ title: "", priority: "important", note: "", deadline: "" });
  const bottomRef = useRef(null);
  const toastTmr = useRef(null);

  /* INIT */
  useEffect(() => {
    const d = load() ?? SEED();
    setData(d);
    // Check daily reminder
    const today = TODAY();
    if (d.lastReminder !== today && d.tasks?.filter(t => !t.done).length > 0) {
      setTimeout(() => triggerDailyReminder(d), 1500);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.chat]);

  const commit = (nd) => { setData(nd); persist(nd); };

  const pop = (msg) => {
    clearTimeout(toastTmr.current);
    setToast({ msg, on: true });
    toastTmr.current = setTimeout(() => setToast(t => ({ ...t, on: false })), 2500);
  };

  /* DAILY REMINDER */
  const triggerDailyReminder = (d) => {
    const open = (d.tasks || []).filter(t => !t.done);
    const urgent = open.filter(t => t.priority === "urgent");
    const msg = urgent.length > 0
      ? `Du hast ${urgent.length} dringende Aufgabe${urgent.length > 1 ? "n" : ""} – starte damit: "${urgent[0].title}"`
      : `${open.length} offene Aufgabe${open.length > 1 ? "n" : ""} heute. Pack es an.`;
    const reminder = { role: "assistant", content: msg, ts: Date.now() };
    const nd = { ...d, chat: [...(d.chat || []), reminder], lastReminder: TODAY() };
    commit(nd);
  };

  /* ADD TASK MANUALLY */
  const addTask = () => {
    if (!addForm.title.trim()) return pop("Bitte Titel eingeben");
    const task = { id: uid(), title: addForm.title.trim(), priority: addForm.priority, note: addForm.note, deadline: addForm.deadline, done: false, createdAt: new Date().toISOString() };
    const nd = { ...data, tasks: [...(data.tasks || []), task] };
    commit(nd);
    setAddForm({ title: "", priority: "important", note: "", deadline: "" });
    setView("tasks");
    pop("Aufgabe hinzugefügt ✓");
  };

  /* TOGGLE / DELETE */
  const toggleTask = (id) => {
    const tasks = data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    commit({ ...data, tasks });
  };
  const deleteTask = (id) => {
    commit({ ...data, tasks: data.tasks.filter(t => t.id !== id) });
    pop("Gelöscht");
  };

  /* CHAT WITH MENTOR */
  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || loading) return;
    setChatInput("");

    const userMsg = { role: "user", content: msg, ts: Date.now() };
    const newChat = [...(data.chat || []), userMsg];
    const nd = { ...data, chat: newChat };
    setData(nd); persist(nd);
    setLoading(true);

    // Build tasks context
    const openTasks = (data.tasks || []).filter(t => !t.done);
    const tasksCtx = openTasks.length > 0
      ? openTasks.map(t => `- "${t.title}" [${PRIO[t.priority]?.label || t.priority}]`).join("\n")
      : "Keine offenen Aufgaben.";

    const systemPrompt = `Du bist der Peakmodo Task-Mentor. Du hilfst dem Nutzer dabei seine Aufgaben zu organisieren, priorisieren und zu erledigen. Du sprichst Deutsch, bist direkt, motivierend und klar.

Aktuelle offene Aufgaben:
${tasksCtx}

Wenn der Nutzer dir eine Liste von Aufgaben gibt oder sagt er soll priorisieren:
- Teile die Aufgaben in Kategorien ein: Dringend, Wichtig, Bald erledigen, Irgendwann
- Gib konkrete Handlungsempfehlungen
- Antworte IMMER auch mit einem JSON-Block am Ende wenn du Aufgaben erstellen oder aktualisieren sollst

JSON Format für neue Aufgaben:
\`\`\`json
{
  "action": "add_tasks",
  "tasks": [
    {"title": "Aufgabe", "priority": "urgent|important|soon|someday", "note": "optional", "deadline": "optional z.B. Heute, Morgen, Diese Woche"}
  ]
}
\`\`\`

JSON Format um alle Aufgaben neu zu priorisieren:
\`\`\`json
{
  "action": "reprioritize",
  "tasks": [
    {"id": "task_id_oder_titel", "priority": "urgent|important|soon|someday"}
  ]
}
\`\`\`

Antworte kompakt und direkt. Maximal 5-6 Sätze Text, dann das JSON wenn nötig.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          messages: newChat.slice(-12).map(m => ({ role: m.role, content: m.content }))
        })
      });
      const resp = await res.json();
      const reply = resp.content?.[0]?.text || "Verbindungsfehler.";

      // Parse JSON actions from reply
      let updatedTasks = [...(data.tasks || [])];
      let actionDone = false;
      const jsonMatch = reply.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const action = JSON.parse(jsonMatch[1]);
          if (action.action === "add_tasks" && action.tasks) {
            const newTasks = action.tasks.map(t => ({
              id: uid(), title: t.title, priority: t.priority || "important",
              note: t.note || "", deadline: t.deadline || "",
              done: false, createdAt: new Date().toISOString()
            }));
            updatedTasks = [...updatedTasks, ...newTasks];
            actionDone = true;
          } else if (action.action === "reprioritize" && action.tasks) {
            action.tasks.forEach(update => {
              updatedTasks = updatedTasks.map(t => {
                if (t.id === update.id || t.title.toLowerCase().includes(update.id?.toLowerCase())) {
                  return { ...t, priority: update.priority };
                }
                return t;
              });
            });
            actionDone = true;
          }
        } catch(e) { console.error("JSON parse error:", e); }
      }

      // Clean reply (remove json block for display)
      const cleanReply = reply.replace(/```json\n[\s\S]*?\n```/g, "").trim();
      const assistantMsg = { role: "assistant", content: cleanReply, ts: Date.now() };
      const finalChat = [...newChat, assistantMsg];
      const finalNd = { ...nd, chat: finalChat, tasks: updatedTasks };
      commit(finalNd);

      if (actionDone) {
        pop("✓ Aufgaben aktualisiert");
        setTimeout(() => setView("tasks"), 1000);
      }
    } catch(e) {
      const errMsg = { role: "assistant", content: "Verbindungsfehler. Bitte Internetverbindung prüfen.", ts: Date.now() };
      commit({ ...nd, chat: [...newChat, errMsg] });
    }
    setLoading(false);
  };

  if (!data) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: 4 }}>PEAK</div>
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 4, background: "linear-gradient(180deg,#F5D078,#8B6914)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MODO</div>
      </div>
    </div>
  );

  const allTasks = data.tasks || [];
  const openTasks = allTasks.filter(t => !t.done);
  const doneTasks = allTasks.filter(t => t.done);
  const filtered = filter === "all" ? openTasks : filter === "done" ? doneTasks : openTasks.filter(t => t.priority === filter);
  const sortedTasks = [...filtered].sort((a, b) => (PRIO[a.priority]?.sort || 99) - (PRIO[b.priority]?.sort || 99));
  const urgentCount = openTasks.filter(t => t.priority === "urgent").length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0A0A0A", minHeight: "100vh", color: "#E8EAF6", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        input,select,textarea{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#E8EAF6;border-radius:12px;padding:13px 16px;width:100%;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border .2s}
        input:focus,select:focus,textarea:focus{border-color:${G.gold}}
        select option{background:#111}
        textarea{resize:none}
        input::placeholder,textarea::placeholder{color:#444}
        .task-card:hover{transform:translateY(-1px)}
      `}</style>
      <Toast msg={toast.msg} on={toast.on}/>

      {/* ── HEADER ── */}
      <div style={{ padding: "32px 20px 0", background: "linear-gradient(180deg,rgba(201,168,76,.07) 0%,transparent 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, color: "#fff" }}>PEAK</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, background: "linear-gradient(180deg,#F5D078,#8B6914)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MODO</span>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 8 }}>
            {urgentCount > 0 && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 12 }}>🔴</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#EF4444" }}>{urgentCount} dringend</span>
              </div>
            )}
            <div style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "6px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: G.gold }}>{openTasks.length} offen</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "0 20px", paddingBottom: 100, minHeight: "calc(100vh - 100px)", overflowY: "auto" }}>

        {/* ══ TASKS VIEW ══ */}
        {view === "tasks" && (
          <div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
              {[
                { id: "all", label: `Alle (${openTasks.length})` },
                { id: "urgent", label: "🔴 Dringend" },
                { id: "important", label: "🟡 Wichtig" },
                { id: "soon", label: "🟤 Bald" },
                { id: "someday", label: "⚪ Irgendwann" },
                { id: "done", label: `✓ Erledigt (${doneTasks.length})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: `1px solid ${filter === f.id ? G.gold : "rgba(255,255,255,.08)"}`, background: filter === f.id ? G.bg : "transparent", color: filter === f.id ? G.gold : "#666", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s" }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Task list */}
            {sortedTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12, opacity: .3 }}>◎</div>
                <div style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
                  {filter === "done" ? "Noch nichts erledigt." : "Keine Aufgaben. Schreib dem Mentor oder füge eine hinzu!"}
                </div>
                <button onClick={() => setView("chat")} style={{ background: G.grad, color: "#000", border: "none", borderRadius: 12, padding: "12px 20px", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                  Mentor fragen →
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask}/>
              ))}
            </div>

            {/* Quick tip */}
            {openTasks.length > 0 && (
              <div onClick={() => setView("chat")} style={{ marginTop: 16, padding: "14px 16px", background: G.bg, border: `1px solid ${G.border}`, borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <MentorAvatar size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G.gl }}>Mentor fragen</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>„Priorisiere meine Liste für heute"</div>
                </div>
                <span style={{ color: G.gold, fontSize: 16 }}>›</span>
              </div>
            )}
          </div>
        )}

        {/* ══ CHAT VIEW ══ */}
        {view === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
              {/* Welcome */}
              {(data.chat || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <MentorAvatar size={56}/>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 6 }}>Dein Task-Mentor</div>
                  <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginBottom: 20 }}>Schreib mir deine komplette To-Do-Liste.<br/>Ich sortiere, priorisiere und erinnere dich.</div>
                  {/* Quick prompts */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      "Ich muss heute: Rechnung schreiben, Kunde anrufen, Instagram Post, E-Mails beantworten, Sport machen",
                      "Priorisiere meine offenen Aufgaben für heute",
                      "Was soll ich als erstes erledigen?",
                      "Erinnere mich an meine dringenden Aufgaben",
                    ].map((p, i) => (
                      <button key={i} onClick={() => { setChatInput(p); }} style={{ padding: "10px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, color: "#888", fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
                        „{p}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(data.chat || []).map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, animation: "fadeUp .25s ease" }}>
                  {m.role === "assistant" && <div style={{ flexShrink: 0, marginTop: 2 }}><MentorAvatar size={30}/></div>}
                  <div style={{ maxWidth: "82%", padding: "11px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? G.bg : "#111", border: `1px solid ${m.role === "user" ? G.border : "rgba(255,255,255,.07)"}`, fontSize: 13, color: m.role === "user" ? G.gl : "#ddd", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <MentorAvatar size={30}/>
                  <div style={{ padding: "11px 14px", borderRadius: "16px 16px 16px 4px", background: "#111", border: "1px solid rgba(255,255,255,.07)", fontSize: 13, color: "#555", animation: "pulse 1s infinite" }}>···</div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
              <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="Schreib deine To-Do-Liste oder frag den Mentor…" rows={2}
                style={{ flex: 1, padding: "12px 14px", borderRadius: 12, fontSize: 13 }}
              />
              <button onClick={sendChat} disabled={loading} style={{ background: G.grad, color: "#000", border: "none", borderRadius: 12, padding: "0 16px", cursor: loading ? "default" : "pointer", fontWeight: 800, fontSize: 16, flexShrink: 0, opacity: loading ? .6 : 1 }}>→</button>
            </div>
          </div>
        )}

        {/* ══ ADD TASK VIEW ══ */}
        {view === "add" && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Aufgabe hinzufügen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Titel</label>
                <input placeholder="Was muss erledigt werden?" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && addTask()}/>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Priorität</label>
                <select value={addForm.priority} onChange={e => setAddForm({ ...addForm, priority: e.target.value })}>
                  <option value="urgent">🔴 Dringend</option>
                  <option value="important">🟡 Wichtig</option>
                  <option value="soon">🟤 Bald erledigen</option>
                  <option value="someday">⚪ Irgendwann</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Notiz (optional)</label>
                <textarea placeholder="Details…" rows={2} value={addForm.note} onChange={e => setAddForm({ ...addForm, note: e.target.value })}/>
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 6, textTransform: "uppercase" }}>Deadline (optional)</label>
                <input placeholder="z.B. Heute, Morgen, Freitag" value={addForm.deadline} onChange={e => setAddForm({ ...addForm, deadline: e.target.value })}/>
              </div>
              <button onClick={addTask} style={{ background: G.grad, color: "#000", border: "none", borderRadius: 13, padding: "14px", fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer", marginTop: 4 }}>
                Aufgabe hinzufügen ✓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(10,10,10,.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,.06)", padding: "10px 20px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 200 }}>
        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "tasks", label: "Aufgaben", sym: "◎" },
            { id: "chat",  label: "Mentor",   sym: "▲" },
            { id: "add",   label: "Neu",      sym: "+" },
          ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ background: view === n.id ? G.bg : "transparent", border: `1px solid ${view === n.id ? G.border : "transparent"}`, borderRadius: 11, padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", color: view === n.id ? G.gold : "#444", transition: "all .2s" }}>
              <span style={{ fontSize: n.sym === "+" ? 20 : 16, lineHeight: 1 }}>{n.sym}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Clear done */}
        {doneTasks.length > 0 && (
          <button onClick={() => { commit({ ...data, tasks: data.tasks.filter(t => !t.done) }); pop(`${doneTasks.length} erledigte Aufgaben gelöscht`); }}
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "7px 12px", color: "#444", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            ✓ {doneTasks.length} löschen
          </button>
        )}
      </div>
    </div>
  );
}
