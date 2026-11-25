import {useState} from "react";
const SKILLS = ["Python","Programming Fundamentals","Data Structures","Git","SQL","NumPy","Pandas","Statistics","Probability","Mathematics","Machine Learning","Deep Learning","Computer Vision","Natural Language Processing","Data Visualization","Docker","APIs"];
async function api(path, body) {
  const response = await fetch("/api/"+path, {method:"POST", ...(body instanceof FormData ? {body} : {headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})});
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail==="string"?data.detail:JSON.stringify(data.detail));
  return data;
}
function Picker({title,selected,onChange,evidence=[]}) {
  return <section className="field"><h3>{title}</h3><div className="tag-list">{SKILLS.map(s=><button type="button" key={s} aria-pressed={selected.includes(s)} className={"choice-tag "+(selected.includes(s)?"selected":"")} onClick={()=>onChange(selected.includes(s)?selected.filter(x=>x!==s):[...selected,s])}>{s}</button>)}</div>{evidence.map(e=><p key={e.skill}><strong>{e.skill}</strong> ({e.method}): {e.evidence}</p>)}</section>;
}
export default function App(){
 const [syllabus,S]=useState(""),[job,J]=useState(""),[curr,C]=useState([]),[required,R]=useState([]),[known,K]=useState([]),[days,D]=useState(30),[hours,H]=useState(3),[matches,M]=useState(null),[result,T]=useState(null),[busy,B]=useState(false),[error,E]=useState("");
 async function run(fn){B(true);E("");try{await fn()}catch(e){E(e.message)}finally{B(false)}}
 function upload(file,set){if(!file)return;run(async()=>{const form=new FormData();form.append("file",file);const d=await api("extract-pdf",form);set(d.text);M(null);T(null);if(d.truncated)E("PDF text was truncated to 30,000 characters.");});}
 return <div className="app-shell"><header className="topbar"><div className="brand">PathAI</div><span>Academic &amp; career pathway studio</span></header><main><section className="hero"><div className="hero-copy"><h1>From curriculum to career.</h1><p>Compare real academic and industry documents, confirm skills, and build a prerequisite-valid plan within your available time.</p></div></section><section className="workspace"><div className="profile-card">
 <h2>1. Analyze documents</h2><p>Upload a text-based PDF or paste text. Only include relevant syllabus units and job requirements.</p>
 <label>Syllabus PDF <input type="file" accept=".pdf" disabled={busy} onChange={e=>upload(e.target.files[0],S)}/></label><textarea aria-label="Syllabus text" rows={6} value={syllabus} onChange={e=>{S(e.target.value);M(null);T(null)}}/>
 <label>Job description PDF <input type="file" accept=".pdf" disabled={busy} onChange={e=>upload(e.target.files[0],J)}/></label><textarea aria-label="Job description" rows={6} value={job} onChange={e=>{J(e.target.value);M(null);T(null)}}/>
 <button className="primary-button" disabled={busy||!syllabus.trim()||!job.trim()} onClick={()=>run(async()=>{T(null);const d=await api("extract-skills",{syllabus,job_description:job});M(d);C(d.curriculum.map(x=>x.skill));R(d.job.map(x=>x.skill));})}>Extract skill candidates</button>
 <h2>2. Confirm skills</h2><p>AI matches may be incorrect. Review the evidence and correct the selections. Curriculum coverage does not prove mastery.</p>
 <Picker title="Curriculum coverage" selected={curr} onChange={v=>{C(v);T(null)}} evidence={matches?.curriculum}/>
 <Picker title="Job requirements" selected={required} onChange={v=>{R(v);T(null)}} evidence={matches?.job}/>
 <Picker title="Skills you already know" selected={known} onChange={v=>{K(v);T(null)}}/>
 <h2>3. Set your time budget</h2><label>Days <input type="number" min="1" max="365" value={days} onChange={e=>{D(Number(e.target.value));T(null)}}/></label> <label>Hours per day <input type="number" min="0.5" max="24" step="0.5" value={hours} onChange={e=>{H(Number(e.target.value));T(null)}}/></label>
 <p>Available time: {days*hours} hours</p><button className="primary-button" disabled={busy||!required.length||days<1||days>365||hours<=0||hours>24} onClick={()=>run(async()=>T(await api("plan",{curriculum_skills:curr,required_skills:required,known_skills:known,days,hours_per_day:hours})))}>Optimize pathway</button>
 {busy&&<p role="status">Processing… First AI request may download the model.</p>}{error&&<p role="alert" className="error-box">{error}</p>}
 </div>{result&&<div className="result-card"><h2>4. Your pathway report</h2><h3>Curriculum gaps</h3><p>{result.curriculum_gaps.join(", ")||"None among confirmed requirements"}</p><h3>Personal gaps</h3><p>{result.personal_gaps.join(", ")||"None among confirmed requirements"}</p><h3>Time-constrained plan</h3><p>{result.plan.planned_hours} of {result.plan.budget_hours} available hours · Full path estimate: {result.plan.estimated_full_hours} hours</p><ol>{result.plan.scheduled.map(s=><li key={s.skill}>{s.skill} — {s.hours} hours (prerequisites: {s.prerequisites.join(", ")||"none"})</li>)}</ol><p>Deferred: {result.plan.deferred.join(", ")||"None"}</p><p>{result.plan.estimates_note}</p><h3>Alternative careers (knowledge-base requirements)</h3>{result.careers.map(c=><div key={c.role} className="metric-card"><div><strong>{c.role}</strong><p>Full estimate: {c.estimated_full_hours} hours · Planned: {c.planned_hours} hours · Target skills known or scheduled: {c.target_skills_covered.length}/{c.target_skills_total}</p></div></div>)}</div>}</section></main></div>;
}
