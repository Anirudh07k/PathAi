import { useMemo, useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookOpen, BrainCircuit, Check,
  ChevronDown, CircleHelp, Compass, GraduationCap, LoaderCircle, Sparkles,
  Target, TrendingUp, WandSparkles, X
} from "lucide-react";

const CAREERS = [
  "Machine Learning Engineer",
  "Data Scientist",
  "Computer Vision Engineer",
  "NLP Engineer",
  "Backend Developer",
];

const SUBJECTS = [
  "Programming", "Data Structures", "Database Management", "Mathematics",
  "Statistics", "Machine Learning", "Artificial Intelligence", "Computer Networks",
];

const SKILLS = [
  "Python", "Programming Fundamentals", "Data Structures", "Git", "SQL",
  "NumPy", "Pandas", "Statistics", "Probability", "Mathematics",
  "Machine Learning", "Deep Learning", "Computer Vision", "Natural Language Processing",
  "Data Visualization", "Docker", "APIs",
];

function TagPicker({ label, hint, options, selected, onChange }) {
  const toggle = (value) => onChange(
    selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
  );
  return (
    <div className="field">
      <div className="field-heading">
        <label>{label}</label>
        {hint && <span>{hint}</span>}
      </div>
      <div className="tag-list">
        {options.map((item) => (
          <button
            className={`choice-tag ${selected.includes(item) ? "selected" : ""}`}
            key={item}
            type="button"
            onClick={() => toggle(item)}
            aria-pressed={selected.includes(item)}
          >
            {selected.includes(item) && <Check size={13} strokeWidth={2.5} />}
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub, tone = "mint" }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </div>
  );
}

function App() {
  const [subjects, setSubjects] = useState(["Programming", "Mathematics"]);
  const [skills, setSkills] = useState(["Python", "Git"]);
  const [profileText, setProfileText] = useState("");
  const [targetRole, setTargetRole] = useState("Machine Learning Engineer");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("form");

  const analysis = result?.pathway_analysis;
  const readiness = Number(analysis?.readiness_percent ?? 0);
  const detectedSkills = result?.ai_detected_skills ?? [];
  const semanticMatches = result?.semantic_matches ?? [];
  const learningPath = analysis?.learning_path ?? [];
  const gaps = analysis?.skill_gaps ?? [];

  const displayPath = useMemo(() => learningPath.map((step, index) => {
    if (typeof step === "string") return { name: step, index };
    return {
      name: step.skill ?? step.name ?? step.title ?? JSON.stringify(step),
      index,
      detail: step.reason ?? step.description ?? "",
    };
  }), [learningPath]);

  async function handleAnalyze(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects, skills, profile_text: profileText, target_role: targetRole }),
      });
      if (!response.ok) {
        let message = `The API returned status ${response.status}.`;
        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {}
        throw new Error(message);
      }
      const data = await response.json();
      if (!data.pathway_analysis) throw new Error("The API response did not include pathway_analysis. Check the backend response format.");
      setResult(data);
      setView("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        `${err.message} Make sure the PathAI FastAPI server is running at http://127.0.0.1:8000, then try again.`
      );
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setView("form");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); startOver(); }}>
          <span className="brand-mark"><BrainCircuit size={23} /></span>
          <span>path<span className="brand-ai">ai</span><small>YOUR FUTURE, IN FOCUS</small></span>
        </a>
        <nav className="topnav" aria-label="Main navigation">
          <a className={view === "form" ? "active" : ""} href="#build" onClick={(e) => { e.preventDefault(); startOver(); }}>Build your path</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }); }}>How it works</a>
        </nav>
        <div className="nav-status"><span className="status-dot" /> AI pathway studio</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={14} /> PERSONALIZED CAREER INTELLIGENCE</div>
            <h1>Your next step,<br /><span>beautifully mapped.</span></h1>
            <p>Turn what you know into where you want to go. PathAI finds your skill gaps and builds a learning path around your career goal.</p>
            <div className="hero-points">
              <span><Check size={15} /> Skill gap analysis</span>
              <span><Check size={15} /> AI-assisted matching</span>
              <span><Check size={15} /> Ordered learning roadmap</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration of a personalized learning pathway">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-center"><Compass size={39} strokeWidth={1.4} /></div>
            <div className="float-card float-top"><span className="mini-icon purple"><Target size={15} /></span><span><b>Career goal</b><small>Find your direction</small></span></div>
            <div className="float-card float-bottom"><span className="mini-icon green"><TrendingUp size={15} /></span><span><b>Growth, mapped</b><small>One skill at a time</small></span></div>
            <div className="spark spark-a">✳</div><div className="spark spark-b">✦</div>
          </div>
        </section>

        <section className="workspace" id="build">
          <div className="section-intro">
            <div><span className="section-kicker">YOUR STARTING POINT</span><h2>{view === "results" ? "Your pathway overview" : "Let's shape your future."}</h2></div>
            {view === "results" && <button className="text-button" onClick={startOver}><ArrowDown size={15} /> Edit profile</button>}
          </div>

          {view === "form" ? (
            <div className="builder-grid">
              <form className="profile-card" onSubmit={handleAnalyze}>
                <div className="card-title"><span className="step-number">01</span><div><h3>Your profile</h3><p>Start with what you already know.</p></div></div>
                <TagPicker label="Subjects you've studied" hint="Choose all that apply" options={SUBJECTS} selected={subjects} onChange={setSubjects} />
                <div className="form-divider" />
                <TagPicker label="Skills you already have" hint="It's okay to start small" options={SKILLS} selected={skills} onChange={setSkills} />
                <div className="form-divider" />
                <div className="field">
                  <div className="field-heading"><label htmlFor="profile">Tell us a little more</label><span>Optional</span></div>
                  <textarea id="profile" value={profileText} onChange={(e) => setProfileText(e.target.value)} placeholder="For example: I've built a few Python projects, enjoy solving data problems, and want to learn how machine learning models work..." rows={4} />
                  <div className="textarea-footer"><WandSparkles size={14} /> PathAI can use this text to discover related skills.</div>
                </div>
                <div className="form-divider" />
                <div className="field">
                  <div className="field-heading"><label htmlFor="role">Your target career</label><span>Choose one</span></div>
                  <div className="select-wrap"><Target size={17} /><select id="role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>{CAREERS.map((role) => <option key={role}>{role}</option>)}</select><ChevronDown size={16} className="select-chevron" /></div>
                </div>
                {error && <div className="error-box" role="alert"><CircleHelp size={18} /><span>{error}</span></div>}
                <button className="primary-button submit-button" type="submit" disabled={loading}>
                  {loading ? <><LoaderCircle className="spin" size={18} /> Building your pathway…</> : <>Build my learning path <ArrowRight size={18} /></>}
                </button>
                <p className="privacy-note">Your profile is used to generate this analysis. Results are guidance, not a guarantee of employment.</p>
              </form>

              <aside className="side-column">
                <div className="insight-card">
                  <div className="insight-icon"><Sparkles size={19} /></div>
                  <span className="section-kicker">THE PATHAI APPROACH</span>
                  <h3>A clearer route from learning to doing.</h3>
                  <p>We compare your current skills with the requirements of your target role, then organize missing skills into a sensible learning sequence.</p>
                  <div className="mini-roadmap">
                    <div className="mini-step done"><span><Check size={13} /></span><div><b>Where you are</b><small>Your current knowledge</small></div></div>
                    <div className="mini-connector" />
                    <div className="mini-step current"><span>2</span><div><b>What to build</b><small>Your skill gaps</small></div></div>
                    <div className="mini-connector" />
                    <div className="mini-step"><span>3</span><div><b>Where you're headed</b><small>Your learning roadmap</small></div></div>
                  </div>
                </div>
                <div className="tip-card"><BookOpen size={18} /><div><b>Small steps add up.</b><p>You don't need to know everything today. Start with the next useful skill.</p></div></div>
                <div className="side-footnote"><span className="status-dot" /> Built for curious minds and ambitious goals.</div>
              </aside>
            </div>
          ) : (
            <div className="results-layout">
              <div className="results-main">
                <div className="result-banner">
                  <div><span className="section-kicker">YOUR TARGET ROLE</span><h3>{result.target_role || targetRole}</h3><p>A starting point for your personalized learning journey.</p></div>
                  <div className="target-badge"><GraduationCap size={23} /></div>
                </div>
                <div className="metrics-grid">
                  <Metric icon={Target} label="Readiness indicator" value={`${Math.round(readiness)}%`} sub="Based on required skills" />
                  <Metric icon={Check} label="Skills recognized" value={String(analysis?.known_skills?.length ?? skills.length)} sub="From your profile" tone="green" />
                  <Metric icon={TrendingUp} label="Skills to explore" value={String(gaps.length)} sub="Identified skill gaps" tone="purple" />
                </div>
                <div className="result-card">
                  <div className="result-card-heading"><div><span className="section-kicker">YOUR ROADMAP</span><h3>Learn in the right order</h3></div><span className="count-pill">{displayPath.length} steps</span></div>
                  {displayPath.length ? <div className="roadmap-list">{displayPath.map((step, index) => <div className="roadmap-item" key={`${step.name}-${index}`}><div className="roadmap-marker">{String(index + 1).padStart(2, "0")}</div><div className="roadmap-content"><b>{step.name}</b><p>{step.detail || (index === 0 ? "Start here and build a strong foundation." : "Build on the skills you've learned before this step.")}</p></div><span className="roadmap-arrow"><ArrowUpRight size={17} /></span></div>)}</div> : <p className="empty-state">No learning steps were returned. You may already cover the skills in this role, or the backend may have returned an empty path.</p>}
                </div>
                <div className="result-card">
                  <div className="result-card-heading"><div><span className="section-kicker">SKILL GAP ANALYSIS</span><h3>Skills to focus on</h3></div><span className="count-pill">{gaps.length} skills</span></div>
                  {gaps.length ? <div className="gap-list">{gaps.map((skill) => <span className="gap-chip" key={typeof skill === "string" ? skill : JSON.stringify(skill)}>{typeof skill === "string" ? skill : skill.skill ?? skill.name ?? JSON.stringify(skill)}</span>)}</div> : <p className="empty-state">No skill gaps were returned for this profile.</p>}
                </div>
              </div>
              <aside className="results-aside">
                <div className="readiness-card"><span className="section-kicker">YOUR STARTING SIGNAL</span><div className="progress-ring" style={{ "--progress": `${Math.max(0, Math.min(100, readiness)) * 3.6}deg` }}><div><strong>{Math.round(readiness)}%</strong><small>readiness</small></div></div><h3>Every step counts.</h3><p>This percentage is an indicative match to the skills in the current PathAI knowledge base—not a measure of your worth or a promise of employability.</p></div>
                <div className="result-card detected-card"><span className="section-kicker">SEMANTIC MATCHING</span><h3>Skills AI picked up</h3>{detectedSkills.length ? <div className="gap-list">{detectedSkills.map((item, i) => <span className="detected-chip" key={typeof item === "string" ? item : item.skill ?? i}><Sparkles size={12} />{typeof item === "string" ? item : item.skill ?? item.name ?? "Detected skill"}</span>)}</div> : <p className="empty-state">No additional skills detected from your description. You can still use your selected skills above.</p>}{semanticMatches.length > 0 && <div className="match-note">{semanticMatches.length} semantic match{semanticMatches.length === 1 ? "" : "es"} found</div>}</div>
                <button className="secondary-button" onClick={startOver}>Analyze another profile <ArrowRight size={16} /></button>
              </aside>
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading"><span className="section-kicker">SIMPLE BY DESIGN</span><h2>From today to your next chapter.</h2><p>A little structure can make a big goal feel possible.</p></div>
          <div className="how-grid">
            <div className="how-card"><span className="how-number">01</span><div className="how-icon"><GraduationCap size={21} /></div><h3>Share your starting point</h3><p>Add subjects, skills, and a little context about what you're interested in.</p></div>
            <div className="how-card"><span className="how-number">02</span><div className="how-icon"><BrainCircuit size={21} /></div><h3>Find your skill gaps</h3><p>PathAI matches your profile to a role using its skill knowledge base and semantic matching.</p></div>
            <div className="how-card"><span className="how-number">03</span><div className="how-icon"><Compass size={21} /></div><h3>Follow your roadmap</h3><p>Get an ordered list of skills to work on, with prerequisites considered where available.</p></div>
          </div>
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#" onClick={(e) => { e.preventDefault(); startOver(); }}><span className="brand-mark"><BrainCircuit size={20} /></span><span>path<span className="brand-ai">ai</span></span></a><span>Made for the journey between learning and opportunity.</span><span className="footer-note">AI-guided. Human-led.</span></footer>
    </div>
  );
}

export default App;