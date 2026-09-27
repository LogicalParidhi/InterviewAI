import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, FileText, Mic, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  ['Resume-aware questions', 'Questions follow your projects, skills, and the role you want.', FileText],
  ['A realistic interview room', 'Answer aloud in a focused, interview-style experience.', Video],
  ['Feedback that teaches', 'Track technical depth, speaking pace, fillers, and clarity.', BrainCircuit],
];

export default function Landing() {
  const { user } = useAuth();
  const startPath = user ? '/resume-upload' : '/register';

  return <div className="min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-indigo-400 selection:text-slate-950">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,.24),transparent_65%)]" />
    <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex items-center gap-2 text-xl font-black">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500">
          <Sparkles size={18}/>
        </span>
        Interview<span className="text-indigo-400">AI</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          /* Sirf clean circular avatar dikhega jo user ko /profile page pr bhejega */
          <Link 
            to="/profile" 
            title="View Profile Information"
            className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 hover:bg-indigo-500/30 hover:scale-105 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          >
            <span className="text-xs font-black tracking-wider">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </Link>
        ) : (
          /* Jab user logged out ho */
          <>
            <Link to="/login" className="hidden text-sm font-semibold text-slate-300 hover:text-white sm:block">
              Log in
            </Link>
            <Link to={startPath} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-indigo-100">
              Start free
            </Link>
          </>
        )}
      </div>
    </nav>
    <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 text-center sm:pt-24">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-300"/> Your interview practice, personalized
      </div>
      <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
        Practice interviews that <span className="text-indigo-400">feel real.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        InterviewAI turns your resume into a live mock interview, then gives you practical feedback on your technical answers and communication.
      </p>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-bold shadow-lg shadow-indigo-600/25 hover:bg-indigo-500">
          {user ? 'Start Mock Interview' : 'Start your first interview'} <ArrowRight size={18}/>
        </Link>
        {user ? (
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 font-bold hover:border-slate-500">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 font-bold hover:border-slate-500">
            I already have an account
          </Link>
        )}
      </div>
      <div className="mx-auto mt-16 grid max-w-5xl gap-4 rounded-3xl border border-slate-800 bg-slate-900/75 p-4 text-left shadow-2xl shadow-black/30 md:grid-cols-[1.1fr_.9fr]"><div className="rounded-2xl border border-slate-700 bg-slate-950 p-6"><div className="flex items-center justify-between"><p className="font-semibold">Java Backend · Technical round</p><span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">Live practice</span></div><p className="mt-9 text-xs font-bold uppercase tracking-widest text-indigo-300">Question 03 of 10</p><p className="mt-3 text-xl font-semibold leading-8">Your Scholarship Portal uses JWT. Walk me through how you protect a request from login through authorization.</p><div className="mt-8 flex items-center gap-3 rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-red-500 text-white"><Mic size={18}/></span><div><p className="text-sm font-semibold">Ready when you are</p><p className="text-xs text-slate-400">Your answer will be transcribed securely.</p></div></div></div><div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6"><p className="text-sm font-semibold text-indigo-100">After the interview</p><p className="mt-2 text-3xl font-black">87<span className="text-base font-medium text-indigo-200"> / 100</span></p><div className="mt-6 space-y-4">{[['Technical depth','90'],['Communication','82'],['Confidence','79']].map(([label, score]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{score}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{width: `${score}%`}}/></div></div>)}</div><p className="mt-7 border-t border-white/20 pt-4 text-sm text-indigo-100">Next focus: HashMap collisions and concurrency.</p></div></div>
    </main><section className="border-y border-slate-800 bg-slate-900/50"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-3">{features.map(([title, detail, Icon]: any) => <article key={title} className="rounded-2xl border border-slate-800 bg-slate-950 p-6"><Icon className="text-indigo-400"/><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p></article>)}</div></section><footer className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-slate-500"><span>© 2026 InterviewAI</span><span className="flex items-center gap-2"><ShieldCheck size={16}/> Built with privacy in mind</span></footer>
  </div>;
}
