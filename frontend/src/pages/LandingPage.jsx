import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/team/Logo.jpg';
import team1 from '../assets/team/001.png';
import team2 from '../assets/team/002.png';
import team3 from '../assets/team/003.png';
import team4 from '../assets/team/004.png';

const VERCEL_URL = 'https://mamacord-ai.vercel.app/';

const TEAM = [
  { img: team1, name: 'Dr. Uthman Babatunde', title: 'Medical Doctor / AI Researcher', desc: 'Clinical lead, obstetric expertise' },
  { img: team2, name: 'Olamide Oso', title: 'AI Software Engineer', desc: 'RAG pipeline, LLM integration' },
  { img: team3, name: 'Fadekemi Fadare', title: 'Public Health Expert & Advocate', desc: 'Health systems integration' },
  { img: team4, name: 'Ezekiel Oladejo', title: 'Business Expert', desc: 'Strategy and business model' },
];

const METRICS = [
  { number: '50+', label: 'PHC workers and CHWs using Mamacord AI in Ibadan, Nigeria' },
  { number: '< 2 min', label: 'average triage decision time per patient' },
  { number: '1,200+', label: 'WHO Maternal Health Guideline chunks indexed' },
  { number: '< $0.004', label: 'per triage decision (vs. $120–$600 for specialist access)' },
  { number: '2', label: 'private PHC networks in Oyo State in active deployment conversations' },
  { number: 'Harvard HSIL', label: 'Hackathon 2026 · Presented and validated' },
];

const REVENUE = [
  { stream: 'B2G', desc: 'License to state ministries of health and NGOs, per-PHC or per-CHW deployed' },
  { stream: 'B2B', desc: 'Subscription for private hospital networks with structured referral data feed' },
  { stream: 'Grants', desc: 'WHO · Gates Foundation · USAID maternal health programmes' },
];

const ROADMAP = [
  { emoji: '🟡', phase: 'Phase 1 · Done', desc: 'Prototype built · RAG triage engine · Deployed on Vercel' },
  { emoji: '🟡', phase: 'Phase 2 · Next', desc: 'PHC nurse pilot · Obstetrician-validated triage · B2G licensing' },
  { emoji: '⚫', phase: 'Phase 3', desc: 'State-level rollout · NHMIS integration · Private hospital licensing' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'Mamacord AI — Maternal Triage for Frontline Health Workers';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Maternal triage for pre-eclampsia, haemorrhage and sepsis. Built for TBAs, CHWs and PHC nurses in low-resource settings.');
    }
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white px-5 py-3 flex items-center justify-between transition-shadow duration-200 ${scrolled ? 'border-b border-gray-200 shadow-sm' : ''}`}>
        <Link to="/">
          <img src={logo} alt="Mamacord AI" className="h-9 w-auto" />
        </Link>
        <Link
          to="/triage"
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Try Demo →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen bg-[#111111] pt-20 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-14 w-full grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div className="space-y-6">
            <p className="text-accent text-[11px] font-semibold tracking-widest uppercase">
              Maternal Triage · AI-Powered
            </p>
            <h1 className="font-serif text-4xl lg:text-[3.25rem] font-bold text-white leading-[1.15]">
              Connecting Millions of Mothers to Life-Saving Maternal Care
            </h1>
            <p className="text-gray-300 text-base leading-relaxed max-w-lg">
              Triage for pre-eclampsia, haemorrhage, and sepsis. Built for frontline health workers in low-resource settings.
            </p>

            {/* Pull quote */}
            <blockquote className="border-l-[3px] border-accent pl-5">
              <p className="font-serif italic text-accent text-base leading-relaxed">
                "I didn't read about this problem. I trained inside it."
              </p>
              <footer className="text-gray-400 text-sm mt-1.5">
                Dr. Uthman Babatunde, CEO &amp; Co-founder
              </footer>
            </blockquote>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 rounded-xl px-5 py-3">
                <p className="text-white font-bold text-lg leading-none">1,047 / 100K</p>
                <p className="text-gray-300 text-xs mt-1.5">maternal deaths in Nigeria (WHO)</p>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-3">
                <p className="text-white font-bold text-lg leading-none">30%</p>
                <p className="text-gray-300 text-xs mt-1.5">of global maternal deaths</p>
              </div>
            </div>

            {/* Primary CTA */}
            <Link
              to="/triage"
              className="block w-full lg:w-auto text-center bg-primary text-white text-base font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try the Live Demo →
            </Link>
            <p className="text-gray-400 text-xs">
              Live app · No sign-up required · Opens in under 5 seconds
            </p>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-gray-400 text-sm hover:text-accent transition-colors"
            >
              See how it works ↓
            </button>
          </div>

          {/* Right — Phone Mockup (hidden on small mobile) */}
          <div className="hidden sm:flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-primary opacity-25 blur-[60px] rounded-full scale-75 pointer-events-none" />
              <div
                className="relative w-56 bg-[#181818] rounded-[2.5rem] border-[5px] border-gray-700 shadow-2xl overflow-hidden"
                style={{ height: '480px' }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-20 h-1.5 bg-gray-700 rounded-full" />
                </div>
                <div className="mx-4 mt-2 mb-3 bg-[#2a0808] border border-danger/40 rounded-xl py-2 text-center">
                  <span className="text-danger text-xs font-bold tracking-wide">⚠ RISK LEVEL: RED</span>
                </div>
                <div className="px-4 space-y-3">
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase tracking-wider">Primary Concern</p>
                    <p className="text-white text-xs font-semibold mt-0.5">Severe Pre-eclampsia</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase tracking-wider">Clinical Flags</p>
                    <ul className="text-[10px] text-red-300 space-y-0.5 mt-0.5">
                      <li>• BP 165/112 mmHg (critical)</li>
                      <li>• Proteinuria 2+ detected</li>
                      <li>• GA 36 weeks</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase tracking-wider">Required Action</p>
                    <p className="text-danger text-xs font-bold mt-0.5">Immediate Referral Required</p>
                  </div>
                  <div className="bg-primary/20 border border-primary/30 rounded-lg p-2.5 mt-1">
                    <p className="text-accent text-[9px] font-bold uppercase tracking-wider">Mamacord AI Referral Summary</p>
                    <p className="text-gray-300 text-[9px] mt-1 leading-relaxed">
                      Patient, 28F, G2P1, 36/40. BP 165/112. Protein 2+. Severe pre-eclampsia. Immediate obstetric review required at receiving facility.
                    </p>
                  </div>
                  <button className="w-full bg-primary text-white text-[10px] font-bold py-2 rounded-lg">
                    Download Referral Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-[#1a1a1a] py-4 px-6">
        <p className="text-center text-gray-400 text-xs tracking-wide">
          Built at Harvard HSIL Hackathon 2026 &nbsp;·&nbsp; WHO-Grounded Guidelines &nbsp;·&nbsp; Live &amp; Deployed &nbsp;·&nbsp; SRHIN Alpha Team
        </p>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-background py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <div className="space-y-12">
            <div>
              <p className="font-serif text-5xl lg:text-6xl font-bold text-primary leading-none">Every 2 min</p>
              <p className="text-gray-600 text-sm mt-3">a maternal death occurs globally (WHO 2025)</p>
            </div>
            <div>
              <p className="font-serif text-5xl lg:text-6xl font-bold text-primary leading-none">70%</p>
              <p className="text-gray-600 text-sm mt-3">of global maternal deaths occur in Sub-Saharan Africa</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4">The Problem</p>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#111111] leading-snug mb-5">
              Over 60% of maternal deaths are from three conditions detectable in under 2 minutes.
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-7">
              Pre-eclampsia. Haemorrhage. Sepsis. All three have clear clinical thresholds. All three are survivable with early referral. But in rural Nigeria, TBAs, CHWs and PHC nurses have no objective tool to identify them.
            </p>
            <div className="space-y-3.5">
              {[
                'No standardised triage tool for non-specialist workers',
                'No clinical summary when patients are referred',
                'No digital record: data disappears at every transition',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-danger font-bold mt-px shrink-0">✗</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img src={logo} alt="Mamacord AI" className="h-10 w-auto mx-auto" />
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl italic text-white mb-14 leading-snug">
            "Obstetrician-level triage. Any smartphone. Under 2 minutes."
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-[#0a2e18] rounded-2xl p-7 text-left border border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-success inline-block" />
                <span className="text-success font-bold text-sm tracking-wide">GREEN</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">Routine monitoring. No immediate action.</p>
            </div>
            <div className="bg-[#2e2100] rounded-2xl p-7 text-left border border-warning/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-warning inline-block" />
                <span className="text-warning font-bold text-sm tracking-wide">YELLOW</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">Elevated risk. Increase monitoring frequency.</p>
            </div>
            <div className="bg-[#2e0808] rounded-2xl p-7 text-left border border-danger/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-danger inline-block" />
                <span className="text-danger font-bold text-sm tracking-wide">RED</span>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed">Immediate referral. Handover note auto-generated.</p>
            </div>
          </div>

          <Link
            to="/triage"
            className="inline-block bg-white text-primary font-bold text-sm px-9 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            See It In Action →
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-background py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-3 text-center">How It Works</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#111111] text-center mb-16">
            From vitals to referral decision in under 2 minutes.
          </h2>

          <div className="relative">
            <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-px bg-accent opacity-30 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              {[
                {
                  n: '01', title: 'Input',
                  body: 'A frontline worker enters patient vitals: blood pressure, temperature, haemoglobin, urine protein and USS findings directly into the app.',
                },
                {
                  n: '02', title: 'AI Triage',
                  body: 'Mamacord AI runs a hybrid RAG engine grounded in WHO Maternal Health Guidelines. Hard-coded safety overrides prevent hallucination of critical thresholds.',
                },
                {
                  n: '03', title: 'Act',
                  body: 'Green, Yellow, or Red. If Red, a structured clinical handover note is auto-generated and ready to send to the receiving hospital before the patient arrives.',
                },
              ].map(({ n, title, body }) => (
                <div key={n} className="text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center mx-auto mb-5 bg-background">
                    <span className="font-serif font-bold text-accent text-xl">{n}</span>
                  </div>
                  <h3 className="font-bold text-[#111111] mb-2 text-base">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* App flow mock */}
          <div className="mt-14 bg-[#111111] rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e1e1e] rounded-xl p-4">
                <p className="text-accent text-[10px] font-semibold uppercase tracking-wider mb-3">Input Vitals</p>
                {[['Blood Pressure', '165 / 112 mmHg'], ['Temperature', '37.8 °C'], ['PCV', '28%'], ['Proteinuria', '2+']].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{val}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#2a0808] rounded-xl p-4 border border-danger/30">
                <p className="text-danger text-[10px] font-bold uppercase tracking-wider mb-2">⚠ RED ALERT</p>
                <p className="text-white text-xs font-semibold mb-1">Severe Pre-eclampsia</p>
                <p className="text-gray-300 text-[10px] leading-relaxed mb-3">
                  BP exceeds critical threshold. Immediate obstetric referral required.
                </p>
                <div className="bg-primary/30 rounded-lg p-2">
                  <p className="text-accent text-[9px] font-semibold">Referral note ready ✓</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/triage"
              className="inline-block w-full md:w-auto bg-primary text-white font-bold text-base px-10 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Try It Yourself →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRACTION ── */}
      <section className="bg-[#111111] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-accent text-[11px] uppercase tracking-widest font-semibold mb-3 text-center">Traction</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white text-center mb-12">
            Working product. Real users. Live in the field.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {METRICS.map(({ number, label }) => (
              <div key={number + label} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="font-serif text-3xl font-bold text-accent mb-2">{number}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-sm text-center max-w-xl mx-auto leading-relaxed mb-6">
            Safety override thresholds — BP ≥ 160/110, Temp &gt; 38°C, PCV &lt; 21%, Proteinuria ≥ 1+ — are enforced at the Python layer independent of LLM output. Critical danger signs cannot be hallucinated away.
          </p>
          <p className="text-accent text-sm text-center italic">
            Next: structured pilot across a defined PHC network in Oyo State, with outcome tracking per triage decision.
          </p>
        </div>
      </section>

      {/* ── BUSINESS MODEL ── */}
      <section className="bg-background py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Business Model</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#111111] mb-10">
            Sustainable from day one.
          </h2>

          <div className="mb-14">
            {REVENUE.map(({ stream, desc }) => (
              <div key={stream} className="flex gap-6 py-5 border-b border-gray-200 first:border-t">
                <p className="text-primary font-bold font-serif text-lg w-16 shrink-0">{stream}</p>
                <p className="text-gray-600 text-sm leading-relaxed self-center">{desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            {ROADMAP.map(({ emoji, phase, desc }) => (
              <div key={phase} className="flex items-start gap-4">
                <span className="text-base shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="font-semibold text-[#111111] text-sm">{phase}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-accent text-[11px] uppercase tracking-widest font-semibold mb-3 text-center">The Team</p>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white text-center mb-12">
            Built by the people who understand the problem.
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {TEAM.map(({ img, name, title, desc }) => (
              <div key={name} className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-accent/40 bg-white/10">
                  <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-white font-semibold text-sm leading-snug">{name}</p>
                <p className="text-accent italic text-xs mt-1">{title}</p>
                <p className="text-white/70 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <p className="font-serif italic text-white/80 text-base text-center max-w-2xl mx-auto leading-relaxed">
            "We are a team of experienced innovators, AI engineers, public health experts, and implementation scientists, with the clinical lived experience, technical depth, and systems knowledge to scale Mamacord AI to save the millions of mothers who need it."
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#111111] min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-serif text-2xl lg:text-3xl text-white mb-3 leading-snug max-w-xl">
          "We are not just building the future of maternal healthcare."
        </p>
        <p className="font-serif text-3xl lg:text-4xl font-bold italic text-accent mb-14 leading-snug max-w-xl">
          "We are saving our mothers for it."
        </p>

        <Link
          to="/triage"
          className="bg-primary text-white font-bold text-lg px-12 py-4 rounded-xl hover:opacity-90 transition-opacity mb-12"
        >
          Try Mamacord AI Now →
        </Link>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <QRCodeSVG value={VERCEL_URL} size={120} />
          </div>
          <p className="text-gray-400 text-xs italic">Scan to try the live demo</p>
        </div>

        <div className="mt-24">
          <img src={logo} alt="Mamacord AI" className="h-7 w-auto mx-auto opacity-30" />
        </div>
      </section>
    </div>
  );
}
