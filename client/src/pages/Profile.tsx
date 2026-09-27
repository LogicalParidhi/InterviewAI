import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Path apne hisab se check kar lena
import { User, Mail, ShieldAlert, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect background */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Heading */}
        <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Registered Information</h2>

        {/* Info Grid */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3">
            <User className="text-indigo-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-medium text-slate-200 mt-0.5">{user?.name || "Not Available"}</p>
            </div>
          </div>

          {/* Email Field */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3">
            <Mail className="text-indigo-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-medium text-slate-200 mt-0.5">{user?.email || "Not Available"}</p>
            </div>
          </div>

          {/* User ID Field */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3">
            <ShieldAlert className="text-indigo-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Account ID</p>
              <p className="text-xs font-mono text-slate-400 mt-0.5 break-all">{user?._id || "Not Available"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
