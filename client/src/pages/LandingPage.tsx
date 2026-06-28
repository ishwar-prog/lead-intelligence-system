import { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Gauge } from '../components/Gauge';

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen pb-20 overflow-x-hidden font-sans">
      {/* Brand Header */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-8">
        <Link 
          to="/" 
          className="font-mono text-sm uppercase tracking-[0.15em] hover:opacity-80 transition-opacity select-none" 
          style={{ color: 'var(--color-brass-dark)' }}
        >
          LEAD-INTEL // 01
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            to="/trust" 
            className="text-xs font-semibold text-white/80 hover:text-white transition-all duration-300 hover:scale-105 hover:underline decoration-white/30 underline-offset-4 inline-block"
          >
            How it's built to be trusted
          </Link>
        </div>
      </header>

      {/* Main Hero Container & Video Background */}
      <section className="relative w-[calc(100%-2rem)] md:w-full max-w-[1400px] mx-auto rounded-[48px] bg-slate-900 border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden h-[600px] flex flex-col z-10">
        
        {/* Underlying Video Background Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          />
        </div>

        {/* Hero Text Content Wrapper */}
        <div className="relative z-20 flex-1 px-8 md:px-16 pt-16 md:pt-24 flex flex-col items-start justify-start">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl text-left"
          >
            <h1 
              className="font-display text-[42px] md:text-[56px] font-medium tracking-tight text-[#0a1b33] leading-[1.08]"
              dangerouslySetInnerHTML={{ __html: "AI-Powered B2B Lead<br />Qualification & Scoring" }}
            />
            <p className="font-sans text-[14px] md:text-[15px] text-slate-600 mt-5 max-w-lg leading-relaxed">
              An intelligent B2B lead qualification system that scores inbound leads against a transparent five-factor rubric, drafts outreach, and keeps a human reviewer in the loop at every step.
            </p>
          </motion.div>
        </div>

        {/* Floating Bottom Navbar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2.5rem)] md:w-auto px-4 md:px-0">
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-between md:justify-start bg-slate-900/80 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.3)] border border-white/10 gap-3 md:gap-4 w-full md:w-auto"
          >
            {/* Logo placeholder */}
            <div className="w-9 h-9 bg-white/10 border border-white/10 shadow-sm flex items-center justify-center rounded-full select-none text-white font-medium text-sm">
              ✦
            </div>

            {/* Standard navigation buttons */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleScrollToFeatures}
                className="text-[12px] font-semibold text-slate-300 hover:text-white px-2.5 md:px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Products
              </button>
              <button
                onClick={() => navigate('/trust')}
                className="text-[12px] font-semibold text-slate-300 hover:text-white px-2.5 md:px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                Docs
              </button>
            </div>

            {/* Open Console action button (replaces Get in touch) */}
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative px-4 md:px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] bg-white border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10">Open Console</span>
              <ChevronRight size={14} className="relative z-10 text-[#0a1b33] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.nav>
        </div>
      </section>

      {/* Product Content Integration Section */}
      <section ref={featuresRef} className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-16 md:px-8 flex flex-col items-center">
        
        {/* Badge & Headline */}
        <div className="mb-12 text-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-4 font-mono">
            ✦ Calibrated AI Instrument
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
            Every lead, measured to the degree.
          </h2>
          <p className="mt-3.5 text-sm md:text-[15px] text-slate-300 leading-relaxed font-sans">
            A calibrated AI instrument that scores, drafts, and routes inbound leads - reviewed by a human before anything ships.
          </p>
        </div>

        {/* Lead scoring Visual Indicator */}
        <div className="mb-16 flex flex-col items-center bg-white/5 px-8 py-7 rounded-[36px] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-md">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 font-mono mb-4">CURRENT GAUGE SCORE</span>
          <Gauge score={100} size={140} />
          <span className="text-[12px] font-semibold text-white mt-3 font-display">100% Calibrated Match</span>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full">
          {[
            { 
              label: '01 · SCORE', 
              title: 'Rubric, not guesswork', 
              body: 'Five weighted factors, shown in full — never a black box. Inspect each metric dynamically.' 
            },
            { 
              label: '02 · REVIEW', 
              title: 'Human-in-the-loop', 
              body: 'Every draft sits in review before it reaches a prospect. The system drafts, but humans govern.' 
            },
            { 
              label: '03 · SCALE', 
              title: 'Queued, not blocking', 
              body: 'A governed background instrument. Designed for enterprise volume without throttling API rates.' 
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 block mb-5">{f.label}</span>
                <h3 className="text-[18px] font-display font-medium text-white">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300 font-sans">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}