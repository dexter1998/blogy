import { useState, useEffect, useRef } from 'react';
import './Fidem.css';

/* ── Static Data ── */
const LEADS = [
  { id: 1, initials: 'RS', name: 'Rahul Sharma', product: 'HDFC Savings Account', status: 'success', amount: '₹1,600' },
  { id: 2, initials: 'PP', name: 'Priya Patel', product: 'Axis Bank Credit Card', status: 'process', amount: '₹2,600' },
  { id: 3, initials: 'AV', name: 'Amit Verma', product: 'ICICI Demat Account', status: 'success', amount: '₹1,000' },
  { id: 4, initials: 'SI', name: 'Sneha Iyer', product: 'Kotak 811 Account', status: 'process', amount: '₹2,250' },
  { id: 5, initials: 'VS', name: 'Vikram Singh', product: 'SBI Credit Card', status: 'rejected', amount: '₹1,500' },
  { id: 6, initials: 'MK', name: 'Meera Krishnan', product: 'HDFC Credit Card', status: 'success', amount: '₹2,600' },
  { id: 7, initials: 'RG', name: 'Raj Gupta', product: 'Zerodha Demat', status: 'closed', amount: '₹900' },
  { id: 8, initials: 'AT', name: 'Anjali Tiwari', product: 'Personal Loan HDFC', status: 'process', amount: '₹800' },
];

const TEAM_MEMBERS = [
  { id: 1, initials: 'SK', name: 'Surya Kumar', role: 'Team Leader', earnings: '₹24,560', isLeader: true },
  { id: 2, initials: 'MT', name: 'Manish Tiwari', role: 'Partner', earnings: '₹16,250', isLeader: false },
  { id: 3, initials: 'AM', name: 'Anjali Mehta', role: 'Partner', earnings: '₹12,480', isLeader: false },
  { id: 4, initials: 'RS', name: 'Rohit Singh', role: 'Partner', earnings: '₹8,600', isLeader: false },
  { id: 5, initials: 'PN', name: 'Pooja Nair', role: 'Partner', earnings: '₹6,240', isLeader: false },
  { id: 6, initials: 'DK', name: 'Dev Kumar', role: 'Partner', earnings: '₹4,870', isLeader: false },
];

const EARNINGS_BREAKDOWN = [
  { label: 'Bank Accounts', icon: '🏦', amount: '₹4,250' },
  { label: 'Credit Cards', icon: '💳', amount: '₹5,600' },
  { label: 'Demat Accounts', icon: '📈', amount: '₹1,800' },
  { label: 'Personal Loan', icon: '🏠', amount: '₹800' },
];

/* ── Earnings SVG Chart ── */
function EarningsChart() {
  const points = [
    [0, 80], [40, 72], [80, 75], [120, 58], [160, 62], [200, 40], [240, 28], [280, 18], [300, 12]
  ];
  const pathD = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const fillD = pathD + ` L300,100 L0,100 Z`;

  return (
    <svg viewBox="0 0 300 100" width="100%" height="120" className="earnings-chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="300" cy="12" r="5" fill="#8b5cf6" />
      <circle cx="300" cy="12" r="10" fill="rgba(139,92,246,0.2)" />
    </svg>
  );
}

/* ── Team Wave SVG ── */
function TeamWaveSVG() {
  return (
    <svg viewBox="0 0 320 100" width="100%" height="100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d="M0,60 C60,20 120,80 180,40 C240,0 280,60 320,30 L320,100 L0,100 Z" fill="url(#waveGrad)" />
      <path d="M0,75 C80,40 160,90 240,55 C280,38 310,70 320,58 L320,100 L0,100 Z" fill="rgba(139,92,246,0.1)" />
    </svg>
  );
}

/* ── Status Bar ── */
function StatusBar() {
  return (
    <div className="fidem-statusbar">
      <span>9:41</span>
      <div className="fidem-statusbar-icons">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="4" width="3" height="8" rx="1" opacity="0.4"/>
          <rect x="4" y="2.5" width="3" height="9.5" rx="1" opacity="0.6"/>
          <rect x="8" y="1" width="3" height="11" rx="1" opacity="0.8"/>
          <rect x="12" y="0" width="3" height="12" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1.5 8.5C5.5 4.5 18.5 4.5 22.5 8.5M5 12C8 9 16 9 19 12M8.5 15.5C10.5 13.5 13.5 13.5 15.5 15.5"/>
          <circle cx="12" cy="19" r="1" fill="currentColor"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 22, height: 11, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 3, padding: 1.5, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '75%', height: '100%', background: '#22c55e', borderRadius: 1.5 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom Nav ── */
const NAV_ITEMS = [
  {
    id: 'home', label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#8b5cf6' : 'none'} stroke={active ? '#8b5cf6' : '#555'} strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    id: 'leads', label: 'Leads',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#555'} strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    )
  },
  {
    id: 'earnings', label: 'Earnings',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#555'} strokeWidth="1.8">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    )
  },
  {
    id: 'team', label: 'Team',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#8b5cf6' : '#555'} strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    )
  },
];

function BottomNav({ activeScreen, navTo, goTo }) {
  const mainScreens = ['home', 'leads', 'earnings', 'team'];
  if (!mainScreens.includes(activeScreen)) return null;
  const handleNav = navTo || goTo;

  return (
    <div className="fidem-bottom-nav">
      {NAV_ITEMS.map(item => {
        const active = activeScreen === item.id;
        return (
          <button key={item.id} className={`fidem-nav-item${active ? ' active' : ''}`} onClick={() => handleNav(item.id)}>
            {item.icon(active)}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────
   LOGIN SCREEN
──────────────────────────────────────────── */
function LoginScreen({ onOtpSent }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  function handleSend(e) {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onOtpSent(phone);
    }, 1400);
  }

  return (
    <div className="fidem-screen active login-screen">
      <div className="login-bg-glow" />
      <div className="login-bg-glow2" />

      <div className={`login-content${mounted ? ' login-content--in' : ''}`}>
        <div className="login-top">
          <div className="login-shield-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(124,58,237,0.2)" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="login-logo-text">FIDEM</div>
          <div className="login-logo-sub">EARN QUIETLY. GROW LOUDLY.</div>
        </div>

        <div className="login-card">
          <div className="login-card-title">Welcome back</div>
          <div className="login-card-sub">Enter your mobile number to continue</div>

          <form onSubmit={handleSend} className="login-form">
            <div className="login-input-wrap">
              <div className="login-flag">🇮🇳 +91</div>
              <input
                ref={inputRef}
                className="login-input"
                type="tel"
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoComplete="tel"
              />
            </div>

            <button
              type="submit"
              className={`login-btn${loading ? ' login-btn--loading' : ''}${phone.length >= 10 ? ' login-btn--ready' : ''}`}
              disabled={phone.length < 10 || loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>Send OTP <span style={{ marginLeft: 6 }}>→</span></>
              )}
            </button>
          </form>

          <div className="login-terms">
            By continuing, you agree to Fidem's{' '}
            <span className="login-link">Terms of Service</span> &amp;{' '}
            <span className="login-link">Privacy Policy</span>
          </div>
        </div>

        <div className="login-trust-row">
          {['🔒 Bank-grade security', '⚡ Instant access', '✅ 50K+ partners'].map(t => (
            <span key={t} className="login-trust-badge">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   OTP SCREEN
──────────────────────────────────────────── */
function OtpScreen({ phone, onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [shake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      if (otp[i]) {
        const next = [...otp]; next[i] = '';
        setOtp(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        const next = [...otp]; next[i - 1] = '';
        setOtp(next);
      }
    }
  }

  function handleChange(i, val) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      setTimeout(() => inputRefs.current[i + 1]?.focus(), 10);
    }
    if (next.every(d => d) && digit) {
      setTimeout(() => handleVerify(next), 150);
    }
  }

  function handleVerify(digits = otp) {
    if (!digits.every(d => d)) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerified();
    }, 1600);
  }

  function handleResend() {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setResendTimer(30);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  const filled = otp.filter(Boolean).length;

  return (
    <div className="fidem-screen active otp-screen">
      <div className="login-bg-glow" />

      <div className={`login-content${mounted ? ' login-content--in' : ''}`}>
        <div className="login-top">
          <div className="login-shield-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(124,58,237,0.2)" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="login-logo-text">FIDEM</div>
        </div>

        <div className="login-card">
          <button className="otp-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>

          <div className="otp-icon-wrap">
            <div className="otp-icon-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.66A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.9v2z"/>
              </svg>
            </div>
          </div>

          <div className="login-card-title">Verify your number</div>
          <div className="login-card-sub">
            OTP sent to +91 {phone.slice(0, 5)}•••••
          </div>

          <div className={`otp-boxes${shake ? ' otp-shake' : ''}`}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                className={`otp-box${digit ? ' otp-box--filled' : ''}${loading ? ' otp-box--verifying' : ''}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
              />
            ))}
          </div>

          <div className="otp-progress">
            <div className="otp-progress-bar" style={{ width: `${(filled / 6) * 100}%` }} />
          </div>

          <button
            className={`login-btn${loading ? ' login-btn--loading' : ''}${filled === 6 ? ' login-btn--ready' : ''}`}
            onClick={() => handleVerify()}
            disabled={filled < 6 || loading}
          >
            {loading ? <><span className="login-spinner" /> Verifying…</> : 'Verify & Continue'}
          </button>

          <div className="otp-resend">
            {resendTimer > 0 ? (
              <span className="otp-resend-timer">Resend OTP in <strong>{resendTimer}s</strong></span>
            ) : (
              <button className="otp-resend-btn" onClick={handleResend}>Resend OTP</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   SPLASH SCREEN
──────────────────────────────────────────── */
function SplashScreen({ goTo, active }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  return (
    <div className={`fidem-screen${active ? ' active' : ''} splash-screen${mounted ? ' splash--in' : ''}`} onClick={() => goTo('home')}>
      <div className="splash-planet">
        <div className="splash-planet-core" />
        <div className="splash-planet-ring" />
        <div className="splash-planet-highlight" />
      </div>

      <div className="splash-top">
        <div className="splash-logo-text">F I D E M</div>
        <div className="splash-logo-sub">Earn Quietly. Grow Loudly.</div>
      </div>

      <div className="splash-middle">
        <h1 className="splash-headline">
          Access is<br /><span>earned.</span>
        </h1>
        <p className="splash-sub">Fidem is an exclusive network<br />for high performers.</p>
      </div>

      <div className="splash-bottom">
        <div className="splash-swipe-hint">Swipe up to enter</div>
        <div className="splash-swipe-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   HOME SCREEN
──────────────────────────────────────────── */
function HomeScreen({ active, behind, goTo }) {
  return (
    <div className={`fidem-screen${active ? ' active' : ''}${behind ? ' behind' : ''} home-screen`}>
      <StatusBar />
      <div className="home-header">
        <div>
          <div className="home-greeting">Hi Hitesh 👋</div>
        </div>
        <div className="home-avatar">H</div>
      </div>

      <div className="fidem-scroll">
        <div className="home-period">
          <span>This month</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div className="home-earnings-amount">₹12,450</div>
        <div className="home-growth-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          12.4% vs last month
        </div>

        <div className="home-opportunities-row">
          <div className="home-opp-count">3</div>
          <div className="home-opp-label">opportunities<br />unlocked today</div>
        </div>

        <div className="home-card-section">
          <div className="home-section-label">Featured Opportunity</div>
          <div className="home-opp-card" onClick={() => goTo('opportunity')}>
            <div className="home-opp-card-top">
              <div>
                <div className="home-opp-bank-badge">Axis Bank</div>
                <div className="home-opp-card-title" style={{ marginTop: 10 }}>Credit Card</div>
                <div className="home-opp-card-sub">Premium benefits. Maximum rewards.</div>
              </div>
              <div style={{ width: 48, height: 30, borderRadius: 4, background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
            </div>
            <div className="home-opp-card-bottom">
              <div>
                <div className="home-opp-earn-label">You earn</div>
                <div className="home-opp-earn-amount">₹2,600</div>
              </div>
              <div className="home-opp-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="home-fab-wrap">
          <button className="home-fab" onClick={() => goTo('leads')}>+</button>
          <div className="home-fab-hint">Hold to create lead</div>
        </div>
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────
   OPPORTUNITY SCREEN
──────────────────────────────────────────── */
function OpportunityScreen({ active, behind, goTo, goBack }) {
  const [benefitsOpen, setBenefitsOpen] = useState(false);

  function closeBenefits() { setBenefitsOpen(false); }

  return (
    <div className={`fidem-screen opp-screen${active ? ' active' : ''}${behind ? ' behind' : ''}`}>
      <StatusBar />
      <div className="opp-header">
        <button className="opp-close-btn" onClick={goBack}>✕</button>
        <div className="opp-badge">Axis Bank</div>
        <div style={{ width: 32 }} />
      </div>

      <div className="opp-title-section">
        <div className="opp-title">Axis Bank<br />Credit Card</div>
        <div className="opp-subtitle">Premium benefits. Maximum rewards.</div>
      </div>

      <div className="opp-card-visual">
        <div className="opp-card-glow" />
        <div className="opp-card-chip" />
        <div className="opp-card-bank-name">AXIS BANK</div>
        <div className="opp-card-type">Signature</div>
        <div className="opp-card-network">
          <div className="opp-card-circle left" />
          <div className="opp-card-circle right" />
        </div>
        <div style={{ position: 'absolute', bottom: 18, right: 72, color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontStyle: 'italic', fontWeight: 600 }}>VISA</div>
      </div>

      <div className="opp-earn-row">
        <div>
          <div className="opp-earn-label">You earn</div>
          <div className="opp-earn-amount">₹2,600</div>
          <div className="opp-earn-per">Per lead</div>
        </div>
        <button className="opp-earn-go-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div className="opp-benefits-tab" onClick={() => setBenefitsOpen(true)}>
        <div className="opp-benefits-label">Benefits</div>
        <div className="opp-benefits-count">3/3</div>
      </div>

      <div className="opp-cta">
        <button className="opp-cta-btn">
          Share Opportunity
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>

      {/* Benefits Drawer */}
      <div className={`benefits-overlay${benefitsOpen ? ' open' : ''}`} onClick={closeBenefits} />
      <div className={`benefits-sheet${benefitsOpen ? ' open' : ''}`}>
        <div className="benefits-handle" />
        <div className="benefits-sheet-header">
          <div className="benefits-sheet-title">Benefits</div>
          <button className="benefits-close" onClick={closeBenefits}>✕</button>
        </div>
        <div className="benefits-list">
          {[
            { icon: '🎁', title: 'Welcome Benefits', sub: '₹1500 worth gift vouchers' },
            { icon: '✈️', title: 'Travel Benefits', sub: 'Complimentary lounge access' },
            { icon: '⭐', title: 'Reward Points', sub: 'Earn up to 10X EDGE Reward Points' },
          ].map(b => (
            <div key={b.title} className="benefits-item">
              <div className="benefits-icon">{b.icon}</div>
              <div>
                <div className="benefits-item-title">{b.title}</div>
                <div className="benefits-item-sub">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="benefits-cta">
          Share Opportunity
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   LEADS SCREEN
──────────────────────────────────────────── */
function LeadsScreen({ active, behind, goTo }) {
  const [activeTab, setActiveTab] = useState('all');
  const tabs = ['All', 'In Process', 'Success', 'Closed'];

  const filtered = LEADS.filter(l => {
    if (activeTab === 'all') return true;
    if (activeTab === 'In Process') return l.status === 'process';
    if (activeTab === 'Success') return l.status === 'success';
    if (activeTab === 'Closed') return l.status === 'closed';
    return true;
  });

  return (
    <div className={`fidem-screen${active ? ' active' : ''}${behind ? ' behind' : ''}`}>
      <StatusBar />
      <div className="leads-header-row">
        <div className="leads-title">My Leads</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </div>

      <div className="leads-filter-tabs">
        {tabs.map(t => (
          <button key={t} className={`leads-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="fidem-scroll">
        <div className="leads-count">{filtered.length} Leads</div>
        <div className="leads-list">
          {filtered.map(lead => (
            <div key={lead.id} className="lead-row">
              <div className="lead-avatar">{lead.initials}</div>
              <div className="lead-info">
                <div className="lead-name">{lead.name}</div>
                <div className="lead-product">{lead.product}</div>
              </div>
              <div className="lead-right">
                <div className="lead-amount">{lead.amount}</div>
                <div className={`lead-badge ${lead.status}`}>
                  {lead.status === 'process' ? 'In Process' : lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────
   EARNINGS SCREEN
──────────────────────────────────────────── */
function EarningsScreen({ active, behind, goTo }) {
  return (
    <div className={`fidem-screen${active ? ' active' : ''}${behind ? ' behind' : ''}`}>
      <StatusBar />
      <div className="earnings-header-row">
        <div className="earnings-title">Earnings</div>
        <button className="earnings-download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>

      <div className="fidem-scroll">
        <div className="earnings-period">
          <span>This Month</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div className="earnings-amount">₹12,450<span>.75</span></div>

        <div className="earnings-growth">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          12.4% vs last month
        </div>

        <div className="earnings-chart-wrap">
          <EarningsChart />
          <div className="earnings-chart-labels">
            {['May', 'Jun', 'Jul', 'Aug', 'Nov'].map(m => (
              <span key={m} className="earnings-chart-label">{m}</span>
            ))}
          </div>
        </div>

        <div className="earnings-breakdown-section">
          <div className="earnings-breakdown-title">Breakdown</div>
          {EARNINGS_BREAKDOWN.map(item => (
            <div key={item.label} className="earnings-breakdown-row">
              <div className="earnings-breakdown-icon">{item.icon}</div>
              <div className="earnings-breakdown-label">{item.label}</div>
              <div className="earnings-breakdown-amount">{item.amount}</div>
            </div>
          ))}
        </div>

        <div className="earnings-view-all">
          <span>View All Transactions</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </div>
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────
   TEAM SCREEN
──────────────────────────────────────────── */
function TeamScreen({ active, behind, goTo }) {
  return (
    <div className={`fidem-screen${active ? ' active' : ''}${behind ? ' behind' : ''}`}>
      <StatusBar />
      <div className="team-header-row">
        <div className="team-title">My Team</div>
        <button className="team-add-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        </button>
      </div>

      <div className="fidem-scroll">
        <div className="team-stats-grid">
          <div className="team-stat-card">
            <div className="team-stat-value">61</div>
            <div className="team-stat-label">Members</div>
          </div>
          <div className="team-stat-card">
            <div className="team-stat-value purple">₹1.24L</div>
            <div className="team-stat-label">Total Earned</div>
          </div>
        </div>

        <div className="team-wave-card">
          <div className="team-wave-glow" />
          <TeamWaveSVG />
          <div className="team-wave-success">
            <div className="team-wave-success-pct">78%</div>
            <div className="team-wave-success-label">Team Success Rate</div>
          </div>
        </div>

        <div className="team-view-members" onClick={() => goTo('teamMembers')}>
          <span>View Members</span>
          <svg className="team-view-members-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </div>
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────
   TEAM MEMBERS SCREEN
──────────────────────────────────────────── */
function TeamMembersScreen({ active, behind, goBack }) {
  const [activeTab, setActiveTab] = useState('Members');

  return (
    <div className={`fidem-screen${active ? ' active' : ''}${behind ? ' behind' : ''}`}>
      <StatusBar />
      <div className="team-members-header">
        <button className="fidem-back-btn" onClick={goBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="team-members-title">Team Members</div>
      </div>

      <div className="team-members-tabs">
        {['Members', 'Leaderboard'].map(t => (
          <button key={t} className={`team-members-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="fidem-scroll">
        <div className="team-members-count">61 Members</div>
        {TEAM_MEMBERS.map(m => (
          <div key={m.id} className="team-member-row">
            <div className="team-member-avatar">{m.initials}</div>
            <div className="team-member-info">
              <div className="team-member-name">{m.name}</div>
              <div className={`team-member-role${m.isLeader ? ' leader' : ''}`}>{m.role}</div>
            </div>
            <div className="team-member-right">
              <div className="team-member-earnings">{m.earnings}</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   ROOT COMPONENT
──────────────────────────────────────────── */
export default function Fidem() {
  // auth state: 'login' | 'otp' | 'app'
  const [authState, setAuthState] = useState('login');
  const [phone, setPhone] = useState('');

  // app nav state
  const [activeScreen, setActiveScreen] = useState('splash');
  const [history, setHistory] = useState([]);

  function goTo(screen) {
    setHistory(prev => [...prev, activeScreen]);
    setActiveScreen(screen);
  }

  function goBack() {
    setHistory(prev => {
      const next = [...prev];
      const previous = next.pop() ?? 'home';
      setActiveScreen(previous);
      return next;
    });
  }

  function navTo(screen) {
    setHistory([]);
    setActiveScreen(screen);
  }

  /* Auth handlers */
  function handleOtpSent(ph) {
    setPhone(ph);
    setAuthState('otp');
  }

  function handleVerified() {
    setAuthState('app');
  }

  function handleBack() {
    setAuthState('login');
  }

  const nav = { goTo, goBack, navTo, activeScreen };

  return (
    <div className="fidem-root">
      <div className="fidem-phone">
        {authState === 'login' && <LoginScreen onOtpSent={handleOtpSent} />}
        {authState === 'otp' && <OtpScreen phone={phone} onVerified={handleVerified} onBack={handleBack} />}

        {authState === 'app' && (
          <>
            <SplashScreen goTo={nav.goTo} active={activeScreen === 'splash'} />
            <HomeScreen active={activeScreen === 'home'} behind={history.includes('home') && activeScreen !== 'home'} goTo={nav.goTo} goBack={nav.goBack} />
            <OpportunityScreen active={activeScreen === 'opportunity'} behind={history[history.length - 1] === 'opportunity'} goTo={nav.goTo} goBack={nav.goBack} />
            <LeadsScreen active={activeScreen === 'leads'} behind={false} goTo={nav.navTo} />
            <EarningsScreen active={activeScreen === 'earnings'} behind={false} goTo={nav.navTo} />
            <TeamScreen active={activeScreen === 'team'} behind={history.includes('team') && activeScreen === 'teamMembers'} goTo={nav.goTo} />
            <TeamMembersScreen active={activeScreen === 'teamMembers'} behind={false} goBack={nav.goBack} />
            <BottomNav activeScreen={activeScreen} navTo={nav.navTo} />
          </>
        )}
      </div>
    </div>
  );
}
