import { useState, useEffect, useRef, useCallback } from 'react'

// ===== DATA =====
const PLANS = [
  {
    name: 'Basic', price: 1999, tagline: 'Perfect for beginners',
    icon: <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a7 7 0 0 0-1 3.5V20h3.5v-6h2v6H14v-6h2v6H19v-8.5A7 7 0 0 0 17.5 8"/></svg>,
    features: [
      { text: 'Access to gym floor', included: true },
      { text: 'Basic equipment usage', included: true },
      { text: 'Locker room access', included: true },
      { text: 'Free WiFi', included: true },
      { text: 'Group classes', included: false },
      { text: 'Personal trainer', included: false },
      { text: 'Sauna & spa', included: false },
    ],
    featured: false,
  },
  {
    name: 'Pro', price: 3999, tagline: 'For serious athletes', badge: 'Most Popular',
    icon: <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5a5 5 0 0 0 0 7.07"/><path d="M17.5 6.5a5 5 0 0 1 0 7.07"/><path d="M6.5 17.5a5 5 0 0 0 7.07 0"/><path d="M17.5 17.5a5 5 0 0 0-7.07 0"/><circle cx="12" cy="12" r="1"/></svg>,
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'All group classes', included: true },
      { text: '2 PT sessions / month', included: true },
      { text: 'Nutrition guidance', included: true },
      { text: 'Sauna access', included: true },
      { text: 'Unlimited PT sessions', included: false },
      { text: 'VIP lounge', included: false },
    ],
    featured: true,
  },
  {
    name: 'Elite', price: 6999, tagline: 'The ultimate experience',
    icon: <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited PT sessions', included: true },
      { text: 'Custom meal plans', included: true },
      { text: 'Full spa & recovery', included: true },
      { text: 'VIP lounge access', included: true },
      { text: 'Priority class booking', included: true },
      { text: 'Guest passes (2/mo)', included: true },
    ],
    featured: false,
  },
]

const TRAINERS = [
  { name: 'Marcus Johnson', photo: '/images/trainer1.jpg', specialty: 'Strength & Conditioning', bio: '10+ years of experience in powerlifting and functional fitness. NSCA-CSCS certified.', instagram: '#', facebook: '#', whatsapp: '#', phone: '#' },
  { name: 'Sarah Rodriguez', photo: '/images/trainer2.jpg', specialty: 'HIIT & Cardio', bio: 'Former competitive CrossFit athlete. Specializes in high-intensity interval training and endurance.', instagram: '#', facebook: '#', whatsapp: '#', phone: '#' },
  { name: 'David Kim', photo: '/images/trainer3.jpg', specialty: 'Yoga & Mobility', bio: 'RYT-500 certified yoga instructor with a background in physical therapy and injury prevention.', instagram: '#', facebook: '#', whatsapp: '#', phone: '#' },
  { name: 'Aisha Williams', photo: '/images/trainer4.jpg', specialty: 'Nutrition & Weight Loss', bio: 'Registered dietitian and ACE-certified personal trainer. Expert in body recomposition.', instagram: '#', facebook: '#', whatsapp: '#', phone: '#' },
]

const GALLERY = [
  { src: '/images/gallery1.jpg', alt: 'Gym Floor', wide: true },
  { src: '/images/gallery2.jpg', alt: 'Weight Area' },
  { src: '/images/gallery3.jpg', alt: 'Cardio Zone' },
  { src: '/images/gallery4.jpg', alt: 'Strength Training' },
  { src: '/images/gallery5.jpg', alt: 'Functional Area', wide: true },
  { src: '/images/gallery6.jpg', alt: 'Free Weights' },
  { src: '/images/gallery7.jpg', alt: 'Equipment' },
  { src: '/images/gallery8.jpg', alt: 'Training Session' },
]

const TIME_SLOTS = [
  '06:00-07:00','07:00-08:00','08:00-09:00','09:00-10:00',
  '10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00',
  '14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00',
  '18:00-19:00','19:00-20:00','20:00-21:00','21:00-22:00',
]

const TRAINER_DURATIONS = [
  { value: '1', label: '1 Month' },
  { value: '2', label: '2 Months' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '12 Months' },
]

const CHECK_ICON = <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const CROSS_ICON = <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

// ===== SVG ICONS =====
const InstagramIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const FacebookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const WhatsAppIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
const PhoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
const DumbbellIcon = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M4 9.5v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M4 9.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"/><path d="M4 14.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>

// ===== HOOKS =====
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.plan-card, .trainer-card, .section-header, .bmi-form-card, .bmi-result-card, .gallery-item')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1'
          e.target.style.transform = 'translateY(0)'
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])
}

// ===== COMPONENTS =====

function Navbar({ onOpenBooking, onOpenJoin }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#home" className="logo">
          <span className="logo-icon"><DumbbellIcon /></span>IronForge
        </a>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#home" onClick={closeMenu}>Home</a></li>
          <li><a href="#membership" onClick={closeMenu}>Membership</a></li>
          <li><a href="#trainers" onClick={closeMenu}>Trainers</a></li>
          <li><a href="#gallery" onClick={closeMenu}>Gallery</a></li>
          <li><a href="#bmi" onClick={closeMenu}>BMI Calculator</a></li>
        </ul>
        <button type="button" className="nav-join-btn" onClick={onOpenJoin}>Join Now</button>
        <button className={`nav-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}

function Hero({ onOpenBooking }) {
  return (
    <section className="hero" id="home" style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="hero-tag">Welcome to IronForge Gym</p>
        <h1 className="hero-title">Forge Your<br /><span className="accent">Best Self</span></h1>
        <p className="hero-sub">Transform your body and mind with world-class trainers, cutting-edge equipment, and a community that pushes you to be your best every single day.</p>
        <div className="hero-actions">
          <a href="#membership" className="btn btn-primary">View Plans</a>
          <a href="#bmi" className="btn btn-outline">Calculate BMI</a>
          <button type="button" className="btn btn-primary" onClick={onOpenBooking}>Visit Booking</button>
        </div>
        <HeroStats />
      </div>
      <a href="#membership" className="scroll-indicator" aria-label="Scroll down"><span className="scroll-arrow">↓</span></a>
    </section>
  )
}

function HeroStats() {
  const ref = useRef(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated) {
        setAnimated(true)
        obs.unobserve(ref.current)
      }
    }, { threshold: 0.5 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [animated])

  const [vals, setVals] = useState([0, 0, 0])
  const targets = [5000, 25, 150]

  useEffect(() => {
    if (!animated) return
    const start = performance.now()
    const dur = 2000
    function tick(now) {
      const p = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVals(targets.map(t => Math.floor(e * t)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [animated])

  const labels = ['Active Members', 'Expert Trainers', 'Weekly Classes']
  return (
    <div className="hero-stats" ref={ref}>
      {targets.map((t, i) => (
        <div className="stat" key={i}>
          <span className="stat-number">{vals[i].toLocaleString()}</span><span className="stat-plus">+</span>
          <span className="stat-label">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function Membership() {
  return (
    <section className="membership" id="membership">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Pricing Plans</p>
          <h2 className="section-title">Choose Your <span className="accent">Membership</span></h2>
          <p className="section-desc">Flexible plans designed to match every fitness goal and budget. No hidden fees — cancel anytime.</p>
        </div>
        <div className="plans-grid">
          {PLANS.map(p => (
            <div className={`plan-card ${p.featured ? 'featured' : ''}`} key={p.name}>
              {p.badge && <div className="plan-badge">{p.badge}</div>}
              <div className="plan-icon">{p.icon}</div>
              <h3 className="plan-name">{p.name}</h3>
              <p className="plan-tagline">{p.tagline}</p>
              <div className="plan-price">
                <span className="currency">₹</span><span className="amount">{p.price.toLocaleString('en-IN')}</span><span className="period">/mo</span>
              </div>
              <div className="plan-divider" />
              <ul className="plan-features">
                {p.features.map((f, i) => (
                  <li key={i} className={f.included ? '' : 'disabled'}>
                    <span className={`feat-icon ${f.included ? 'check' : 'cross'}`}>{f.included ? CHECK_ICON : CROSS_ICON}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <a href="#join" className={`plan-btn ${p.featured ? 'btn-primary' : 'btn-outline'}`}>Get Started</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Trainers() {
  return (
    <section className="trainers" id="trainers">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Meet the Team</p>
          <h2 className="section-title">Expert <span className="accent">Trainers</span></h2>
          <p className="section-desc">Our certified professionals are dedicated to helping you reach your peak potential.</p>
        </div>
        <div className="trainers-grid">
          {TRAINERS.map(t => (
            <div className="trainer-card" key={t.name}>
              <div className="trainer-avatar"><img src={t.photo} alt={t.name} className="trainer-photo" /></div>
              <h3 className="trainer-name">{t.name}</h3>
              <p className="trainer-specialty">{t.specialty}</p>
              <p className="trainer-bio">{t.bio}</p>
              <div className="trainer-socials">
                {t.instagram && <a href={t.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="trainer-social-btn trainer-social-ig"><InstagramIcon /></a>}
                {t.facebook && <a href={t.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="trainer-social-btn trainer-social-fb"><FacebookIcon /></a>}
                {t.whatsapp && <a href={t.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="trainer-social-btn trainer-social-wa"><WhatsAppIcon /></a>}
                {t.phone && <a href={t.phone} aria-label="Call" className="trainer-social-btn trainer-social-phone"><PhoneIcon /></a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Our Space</p>
          <h2 className="section-title">Gym <span className="accent">Gallery</span></h2>
          <p className="section-desc">Take a look inside our state-of-the-art facility and see what awaits you.</p>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((g, i) => (
            <div className={`gallery-item ${g.wide ? 'gallery-item-wide' : ''}`} key={i}>
              <img src={g.src} alt={g.alt} loading="lazy" />
              <div className="gallery-overlay"><span className="gallery-label">{g.alt}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BMICalculator() {
  const [unit, setUnit] = useState('metric')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightFt, setHeightFt] = useState('')
  const [heightIn, setHeightIn] = useState('')
  const [weightLbs, setWeightLbs] = useState('')
  const [result, setResult] = useState(null)

  const calculate = () => {
    let bmi
    if (unit === 'metric') {
      const h = parseFloat(heightCm), w = parseFloat(weightKg)
      if (!h || !w || h <= 0 || w <= 0) return
      bmi = w / ((h / 100) ** 2)
    } else {
      const ft = parseFloat(heightFt) || 0, inc = parseFloat(heightIn) || 0, lbs = parseFloat(weightLbs)
      const totalIn = ft * 12 + inc
      if (!totalIn || !lbs || totalIn <= 0 || lbs <= 0) return
      bmi = (lbs / (totalIn * totalIn)) * 703
    }
    bmi = Math.round(bmi * 10) / 10
    let category, catClass
    if (bmi < 18.5) { category = 'Underweight'; catClass = 'underweight' }
    else if (bmi < 25) { category = 'Normal Weight'; catClass = 'normal' }
    else if (bmi < 30) { category = 'Overweight'; catClass = 'overweight' }
    else { category = 'Obese'; catClass = 'obese' }
    setResult({ bmi, category, catClass })
  }

  const angle = result ? Math.min(Math.max(((Math.min(Math.max(result.bmi, 10), 40) - 10) / 30) * 180 - 90, -90), 90) : 0

  return (
    <section className="bmi-section" id="bmi">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Health Check</p>
          <h2 className="section-title">BMI <span className="accent">Calculator</span></h2>
          <p className="section-desc">Enter your details below to calculate your Body Mass Index.</p>
        </div>
        <div className="bmi-wrapper">
          <div className="bmi-form-card">
            <div className="bmi-input-group">
              <label>Unit</label>
              <div className="bmi-toggle">
                <button className={`toggle-btn ${unit === 'metric' ? 'active' : ''}`} onClick={() => setUnit('metric')}>Metric</button>
                <button className={`toggle-btn ${unit === 'imperial' ? 'active' : ''}`} onClick={() => setUnit('imperial')}>Imperial</button>
              </div>
            </div>
            {unit === 'metric' ? (
              <>
                <div className="bmi-input-group"><label>Height (cm)</label><input type="number" placeholder="e.g. 175" value={heightCm} onChange={e => setHeightCm(e.target.value)} min="50" max="300" /></div>
                <div className="bmi-input-group"><label>Weight (kg)</label><input type="number" placeholder="e.g. 70" value={weightKg} onChange={e => setWeightKg(e.target.value)} min="10" max="500" /></div>
              </>
            ) : (
              <>
                <div className="bmi-row">
                  <div className="bmi-input-group"><label>Height (ft)</label><input type="number" placeholder="e.g. 5" value={heightFt} onChange={e => setHeightFt(e.target.value)} min="1" max="9" /></div>
                  <div className="bmi-input-group"><label>Height (in)</label><input type="number" placeholder="e.g. 9" value={heightIn} onChange={e => setHeightIn(e.target.value)} min="0" max="11" /></div>
                </div>
                <div className="bmi-row">
                  <div className="bmi-input-group"><label>Weight (lbs)</label><input type="number" placeholder="e.g. 154" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} min="20" max="1100" /></div>
                </div>
              </>
            )}
            <button className="btn btn-primary btn-full" onClick={calculate}>Calculate BMI</button>
          </div>
          {result && (
            <div className="bmi-result-card">
              <div className="bmi-gauge">
                <svg viewBox="0 0 200 120" className="gauge-svg">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" /><stop offset="35%" stopColor="#84cc16" /><stop offset="50%" stopColor="#eab308" /><stop offset="70%" stopColor="#f97316" /><stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" />
                  <line x1="100" y1="100" x2="100" y2="25" stroke="#fff" strokeWidth="3" strokeLinecap="round" transform={`rotate(${angle}, 100, 100)`} style={{ transition: 'transform 1s ease-out' }} />
                </svg>
              </div>
              <div className="bmi-value">{result.bmi}</div>
              <div className={`bmi-category ${result.catClass}`}>{result.category}</div>
              <div className="bmi-scale">
                <span className="scale-item underweight">Underweight<br /><small>&lt; 18.5</small></span>
                <span className="scale-item normal">Normal<br /><small>18.5 – 24.9</small></span>
                <span className="scale-item overweight">Overweight<br /><small>25 – 29.9</small></span>
                <span className="scale-item obese">Obese<br /><small>≥ 30</small></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <a href="#home" className="logo"><span className="logo-icon">⚙</span> IronForge</a>
          <p>Forging stronger bodies and minds since 2015. Your journey to peak fitness starts here.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="#home">Home</a><a href="#membership">Membership</a><a href="#trainers">Trainers</a><a href="#bmi">BMI Calculator</a>
        </div>
        <div className="footer-links">
          <h4>Hours</h4>
          <p>Mon – Sat: 6 AM – 10 PM</p><p>Sunday: Closed</p>
        </div>
        <div className="footer-links">
          <h4>Contact</h4>
          <p>📍 123 Fitness Ave, Gym City</p><p>📞 (555) 123-4567</p><p>✉️ info@ironforge.gym</p>
        </div>
      </div>
      <div className="footer-bottom"><p>&copy; 2026 IronForge Gym. All rights reserved.</p></div>
    </footer>
  )
}

function BookingModal({ isOpen, onClose }) {
  const [screen, setScreen] = useState('form') // 'form' | 'loading' | 'success' | 'error'
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '' })
  const [errors, setErrors] = useState({})

  const validate = (field, val) => {
    if (field === 'phone' && val.length === 10 && !/^[0-9]{10}$/.test(val)) return 'Must be exactly 10 digits.'
    if (field === 'email' && val && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'Please enter a valid email address.'
    return ''
  }

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    const err = validate(field, val)
    setErrors(e => ({ ...e, [field]: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name) errs.name = 'Please enter your full name.'
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Please enter a valid 10-digit phone number.'
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) errs.email = 'Please enter a valid email address.'
    if (form.date) {
      const day = new Date(form.date + 'T00:00:00').getDay()
      if (day === 0) { alert('The gym is closed on Sundays.'); return }
    }
    if (!form.time) { errs.time = 'Please select a visiting time slot.' }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setScreen('loading')
    try {
      // Format time slot
      const formatSlot = (slot) => {
        if (!slot) return ''
        const [start, end] = slot.split('-')
        const fmt = (t) => {
          const [h, m] = t.split(':').map(Number)
          const ampm = h >= 12 ? 'PM' : 'AM'
          const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
          return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
        }
        return `${fmt(start)} – ${fmt(end)}`
      }
      const visitDate = new Date(form.date + 'T00:00:00')
      const formattedDate = visitDate.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })

      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC11_21w3C59L61aiHFQVDukxJs5afit9PCLdt0iMPUWNR3gnonq5rB9BFDWaNqzKP/exec'
      const payload = {
        type: 'visit_booking',
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.trim(),
        date: formattedDate,
        time: formatSlot(form.time),
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setScreen('success')
    } catch (err) {
      console.error('Booking error:', err)
      setScreen('error')
    }
  }

  useEffect(() => {
    if (isOpen) {
      setScreen('form')
      setForm({ name: '', phone: '', email: '', date: '', time: '' })
      setErrors({})
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  const minDate = new Date().toISOString().split('T')[0]

  if (!isOpen) return null

  return (
    <div className="booking-modal active">
      <div className="booking-modal-overlay" onClick={onClose} />
      <div className="booking-modal-content">
        <button className="booking-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="booking-modal-header">
          <h3>Book a <span style={{ color: 'var(--accent)' }}>Visit</span></h3>
          <p>Schedule your free gym visit today</p>
        </div>
        {screen === 'loading' && (
          <div className="booking-loading">
            <div className="btn-spinner"></div>
            <p>Submitting your booking...</p>
          </div>
        )}

        {screen === 'form' && (
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="booking-form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" value={form.name} onChange={e => handleChange('name', e.target.value)} style={errors.name ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
              {errors.name && <span className="field-error-message">{errors.name}</span>}
            </div>
            <div className="booking-form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="Enter your phone number" pattern="[0-9]{10}" value={form.phone} onChange={e => handleChange('phone', e.target.value)} style={errors.phone ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
              {errors.phone && <span className="field-error-message">{errors.phone}</span>}
            </div>
            <div className="booking-form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={errors.email ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
              {errors.email && <span className="field-error-message">{errors.email}</span>}
            </div>
            <div className="booking-form-group">
              <label>Visit Date</label>
              <input type="date" min={minDate} value={form.date} onChange={e => handleChange('date', e.target.value)} required />
            </div>
            <div className="booking-form-group">
              <label>Visiting Time</label>
              <select value={form.time} onChange={e => handleChange('time', e.target.value)} style={errors.time ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required>
                <option value="" disabled>Select a time slot</option>
                {TIME_SLOTS.map(s => {
                  const [h] = s.split(':')
                  const hr = parseInt(h)
                  const ampm = hr >= 12 ? 'PM' : 'AM'
                  const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr
                  const [h2] = s.split('-')[1].split(':')
                  const hr2 = parseInt(h2)
                  const h122 = hr2 > 12 ? hr2 - 12 : hr2 === 0 ? 12 : hr2
                  return <option key={s} value={s}>{h12}:00 {ampm} - {h122}:00 {hr2 >= 12 ? 'PM' : 'AM'}</option>
                })}
              </select>
              <span className="booking-time-hint">Gym hours: 6:00 AM - 10:00 PM (Mon-Sat) | Closed on Sunday</span>
              {errors.time && <span className="field-error-message">{errors.time}</span>}
            </div>
            <button type="submit" className="btn btn-primary booking-submit-btn">Confirm Booking <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          </form>
        )}

        {screen === 'success' && (
          <div className="booking-success">
            <div className="booking-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <h3>Booking Confirmed!</h3>
            <p>We'll contact you shortly to confirm your visit.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        )}

        {screen === 'error' && (
          <div className="booking-error">
            <div className="join-error-icon">⚠️</div>
            <h3>Submission Failed</h3>
            <p>Something went wrong. Your booking was not submitted.</p>
            <button className="btn btn-primary" onClick={() => setScreen('form')}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

function JoinModal({ isOpen, onClose }) {
  const [screen, setScreen] = useState('form') // form | loading | success | error
  const [form, setForm] = useState({ name: '', phone: '', email: '', plan: '', months: '', hasTrainer: false, trainerMonths: '' })
  const [errors, setErrors] = useState({})
  const [membershipData, setMembershipData] = useState(null)
  const [trainerDropdownOpen, setTrainerDropdownOpen] = useState(false)

  const TRAINER_COST = 2000
  const planVal = parseInt(form.plan) || 0
  const monthsVal = parseInt(form.months) || 0
  const trainerMonthsVal = parseInt(form.trainerMonths) || 0
  const planCost = planVal * monthsVal
  const trainerCost = form.hasTrainer ? TRAINER_COST * trainerMonthsVal : 0
  const total = planCost + trainerCost

  const validate = (field, val) => {
    if (field === 'phone' && val.length === 10 && !/^[0-9]{10}$/.test(val)) return 'Must be exactly 10 digits.'
    if (field === 'email' && val && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'Please enter a valid email address.'
    return ''
  }

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    const err = validate(field, val)
    setErrors(e => ({ ...e, [field]: err }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name) errs.name = 'Please enter your full name.'
    if (!/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Please enter a valid 10-digit phone number.'
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) errs.email = 'Please enter a valid email address.'
    if (!form.plan || !form.months) { alert('Please select a plan and membership duration.'); return }
    if (form.hasTrainer && !form.trainerMonths) { alert('Please select trainer duration.'); return }
    if (form.hasTrainer && parseInt(form.trainerMonths) > parseInt(form.months)) { alert('Trainer duration cannot exceed membership duration.'); return }
    if (Object.keys(errs).length) { setErrors(errs); return }

    setScreen('loading')
    try {
      // Generate unique Member ID
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const memberId = `IF-${yy}${mm}${dd}-${rand}`

      // Plan lookup
      const planMap = { '1999': { price: 1999, label: 'Basic' }, '3999': { price: 3999, label: 'Pro' }, '6999': { price: 6999, label: 'Elite' } }
      const planInfo = planMap[form.plan]
      const months = parseInt(form.months, 10)
      const trainer = form.hasTrainer === true || form.hasTrainer === 'true'
      const trainerDur = trainer ? parseInt(form.trainerMonths, 10) : 0
      const planTotal = planInfo.price * months
      const trainerTotal = trainer ? 2000 * trainerDur : 0
      const totalAmount = planTotal + trainerTotal

      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxC11_21w3C59L61aiHFQVDukxJs5afit9PCLdt0iMPUWNR3gnonq5rB9BFDWaNqzKP/exec'
      const payload = {
        memberId,
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        email: form.email.trim(),
        plan: planInfo.label,
        months: `${months} Month${months > 1 ? 's' : ''}`,
        trainer: trainer ? 'Yes' : 'No',
        trainerMonths: trainer ? `${trainerDur} Month${trainerDur > 1 ? 's' : ''}` : 'N/A',
        planCost: `₹${planTotal.toLocaleString('en-IN')}`,
        trainerCost: trainer ? `₹${trainerTotal.toLocaleString('en-IN')}` : '₹0',
        total: `₹${totalAmount.toLocaleString('en-IN')}`,
        paymentStatus: 'Pending',
        membershipStatus: 'Pending',
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setMembershipData({
        memberId,
        name: form.name.trim(),
        plan: planInfo.label,
        duration: `${months} Month${months > 1 ? 's' : ''}`,
        hasTrainer: trainer,
        trainerDuration: trainer ? `${trainerDur} Month${trainerDur > 1 ? 's' : ''}` : null,
        planAmount: '₹' + planTotal.toLocaleString('en-IN'),
        trainerAmount: trainer ? '₹' + trainerTotal.toLocaleString('en-IN') : '₹0',
        totalAmount: '₹' + totalAmount.toLocaleString('en-IN'),
        paymentStatus: 'Pending',
        membershipStatus: 'Pending',
      })
      setScreen('success')
    } catch (err) {
      console.error('Join error:', err)
      setScreen('error')
    }
  }

  const closeTrainerDropdown = useCallback((e) => {
    if (!e.target.closest('.custom-select')) setTrainerDropdownOpen(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setScreen('form')
      setForm({ name: '', phone: '', email: '', plan: '', months: '', hasTrainer: false, trainerMonths: '' })
      setErrors({})
      setMembershipData(null)
      document.body.style.overflow = 'hidden'
      document.addEventListener('click', closeTrainerDropdown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('click', closeTrainerDropdown)
    }
    return () => document.removeEventListener('click', closeTrainerDropdown)
  }, [isOpen, closeTrainerDropdown])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const downloadCard = () => {
    if (!membershipData) return
    const content = `╔══════════════════════════════════════╗
║        IRONFORGE GYM                 ║
║      DIGITAL MEMBERSHIP              ║
╠══════════════════════════════════════╣
║ Member Name:  ${membershipData.name.padEnd(24)}║
║ Member ID:    ${membershipData.memberId.padEnd(24)}║
║ Plan:         ${membershipData.plan.padEnd(24)}║
║ Duration:     ${membershipData.duration.padEnd(24)}║
║ Trainer:      ${(membershipData.hasTrainer ? 'Yes (' + membershipData.trainerDuration + ')' : 'No').padEnd(24)}║
║ Total:        ${membershipData.totalAmount.padEnd(24)}║
╠══════════════════════════════════════╣
║ Payment:      PENDING                ║
║ Membership:   PENDING                ║
╚══════════════════════════════════════╝`
    const blob = new Blob([content], { type: 'text/plain' })
    const link = document.createElement('a')
    link.download = `IronForge-${membershipData.memberId}.txt`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  const trainerInfo = membershipData?.hasTrainer ? `Yes (${membershipData.trainerDuration})` : 'No'
  const waMsg = membershipData ? encodeURIComponent(`Hi, I have submitted a membership request.\n\nMember ID: ${membershipData.memberId}\nName: ${membershipData.name}\nPlan: ${membershipData.plan}\nDuration: ${membershipData.duration}\nTrainer: ${trainerInfo}\nTotal: ${membershipData.totalAmount}\n\nI would like to complete my membership payment.`) : ''

  return (
    <div className="join-modal active">
      <div className="join-modal-overlay" onClick={onClose} />
      <div className="join-modal-content">
        <button className="join-modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="join-modal-header">
          <h3>Join <span style={{ color: 'var(--accent)' }}>IronForge</span></h3>
          <p>Start your fitness journey today</p>
        </div>

        {screen === 'form' && (
          <form className="join-form" onSubmit={handleSubmit}>
            <div className="join-form-row">
              <div className="join-form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" value={form.name} onChange={e => handleChange('name', e.target.value)} style={errors.name ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
                {errors.name && <span className="field-error-message">{errors.name}</span>}
              </div>
              <div className="join-form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="10-digit number" pattern="[0-9]{10}" value={form.phone} onChange={e => handleChange('phone', e.target.value)} style={errors.phone ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
                {errors.phone && <span className="field-error-message">{errors.phone}</span>}
              </div>
            </div>
            <div className="join-form-group">
              <label>Email Address</label>
              <input type="email" placeholder="Enter your email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={errors.email ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' } : {}} required />
              {errors.email && <span className="field-error-message">{errors.email}</span>}
            </div>
            <div className="join-form-row">
              <div className="join-form-group">
                <label>Choose Plan</label>
                <select value={form.plan} onChange={e => handleChange('plan', e.target.value)} required>
                  <option value="" disabled>Select a plan</option>
                  <option value="1999">Basic — ₹1,999/mo</option>
                  <option value="3999">Pro — ₹3,999/mo</option>
                  <option value="6999">Elite — ₹6,999/mo</option>
                </select>
              </div>
              <div className="join-form-group">
                <label>Membership Months</label>
                <select value={form.months} onChange={e => handleChange('months', e.target.value)} required>
                  <option value="" disabled>Select months</option>
                  <option value="1">1 Month</option><option value="2">2 Months</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="12">12 Months</option>
                </select>
              </div>
            </div>
            <div className="join-trainer-section">
              <label className="join-trainer-toggle" onClick={() => { handleChange('hasTrainer', !form.hasTrainer); if (form.hasTrainer) handleChange('trainerMonths', '') }}>
                <span className="join-trainer-label">Need a Personal Trainer? <span className="join-trainer-price-badge">₹2,000/mo</span></span>
                <input type="checkbox" checked={form.hasTrainer} readOnly className="join-trainer-checkbox" />
              </label>
              {form.hasTrainer && (
                <div className="join-trainer-fields">
                  <label>Trainer Duration (Months)</label>
                  <div className={`custom-select ${trainerDropdownOpen ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setTrainerDropdownOpen(!trainerDropdownOpen) }}>
                    <div className="custom-select-display">
                      <svg className="custom-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span className={`custom-select-text ${!form.trainerMonths ? 'placeholder' : ''}`}>{form.trainerMonths ? TRAINER_DURATIONS.find(d => d.value === form.trainerMonths)?.label : 'Select months'}</span>
                    </div>
                    <div className="custom-select-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg></div>
                    <div className="custom-select-dropdown">
                      {TRAINER_DURATIONS.map(d => (
                        <div key={d.value} className={`custom-select-option ${form.trainerMonths === d.value ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); handleChange('trainerMonths', d.value); setTrainerDropdownOpen(false) }}>
                          <span>{d.label}</span>
                          <svg className="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="join-cost-summary">
              <div className="join-cost-row"><span>Plan cost</span><span>{planCost > 0 ? '₹' + planCost.toLocaleString('en-IN') : '₹0'}</span></div>
              <div className="join-cost-row"><span>Trainer cost</span><span>{trainerCost > 0 ? '₹' + trainerCost.toLocaleString('en-IN') : '₹0'}</span></div>
              <div className="join-cost-divider" />
              <div className="join-cost-row join-cost-total"><span>Total</span><span>{total > 0 ? '₹' + total.toLocaleString('en-IN') : '₹0'}</span></div>
            </div>
            <button type="submit" className="btn btn-primary join-submit-btn">Confirm & Join <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          </form>
        )}

        {screen === 'loading' && (
          <div className="join-loading"><div className="join-loading-spinner" /><p>Submitting your membership request...</p></div>
        )}

        {screen === 'success' && membershipData && (
          <div className="join-success">
            <div className="membership-success-header">
              <div className="membership-success-emoji">🎉</div>
              <h3>Membership Request Submitted!</h3>
              <p className="membership-welcome">Welcome to <strong>IronForge Gym</strong></p>
            </div>
            <div className="membership-card" id="membershipCard">
              <div className="membership-card-inner">
                <div className="membership-card-top">
                  <div className="membership-card-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><path d="M6.5 6.5h11M6.5 17.5h11M8 6.5V4M16 6.5V4M8 17.5v2.5M16 17.5v2.5M4 10h16M4 14h16"/></svg><span>IRONFORGE</span></div>
                  <div className="membership-card-badge">DIGITAL MEMBERSHIP</div>
                </div>
                <div className="membership-card-divider" />
                <div className="membership-card-body">
                  {[
                    ['Member Name', membershipData.name],
                    ['Member ID', membershipData.memberId],
                    ['Membership Plan', membershipData.plan],
                    ['Duration', membershipData.duration],
                    ['Trainer', trainerInfo],
                    ['Join Date', new Date().toLocaleDateString('en-IN')],
                    ['Total Amount', membershipData.totalAmount],
                  ].map(([label, val]) => (
                    <div className="membership-card-row" key={label}>
                      <span className="membership-card-label">{label}</span>
                      <span className={`membership-card-value ${label === 'Member ID' ? 'membership-card-id' : ''} ${label === 'Total Amount' ? 'membership-card-amount' : ''}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="membership-card-divider" />
                <div className="membership-card-footer">
                  <div className="membership-card-status"><span className="status-label">Payment Status:</span><span className="status-badge status-pending">PENDING</span></div>
                  <div className="membership-card-status"><span className="status-label">Membership Status:</span><span className="status-badge status-pending">PENDING</span></div>
                </div>
              </div>
            </div>
            <p className="membership-note">⚠️ Payment Required — Your membership will become active after payment is confirmed by the gym.</p>
            <div className="membership-actions">
              <button className="btn btn-primary membership-action-btn" onClick={downloadCard}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Membership Card</button>
              <a className="btn membership-whatsapp-btn" href={`https://wa.me/919876543210?text=${waMsg}`} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 32 32" fill="white" width="18" height="18"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.25l6.14-1.982A15.91 15.91 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.316 22.602c-.39 1.098-1.93 2.01-3.15 2.27-.834.178-1.922.32-5.6-1.204-4.696-1.95-7.71-6.736-7.94-7.05-.224-.314-1.86-2.478-1.86-4.726 0-2.248 1.182-3.348 1.604-3.81.39-.428.934-.54 1.242-.54.31 0 .618.004.89.016.286.012.668-.108 1.04.794.39.95 1.334 3.246 1.45 3.484.116.238.194.514.038.828-.156.314-.234.51-.468.786-.234.276-.492.616-.702.828-.234.238-.478.494-.204.962.274.468 1.218 2.01 2.612 3.256 1.794 1.6 3.304 2.096 3.772 2.33.468.234.742.194 1.016-.118.274-.312 1.16-1.35 1.474-1.818.312-.468.626-.39 1.056-.234.434.156 2.744 1.294 3.216 1.53.468.238.78.354.896.55.116.196.116 1.142-.274 2.24z"/></svg> Contact Gym on WhatsApp</a>
              <button className="btn btn-outline membership-back-btn" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to Website</button>
            </div>
            <p className="membership-contact-hint">Complete your payment at the gym or contact us on WhatsApp.</p>
          </div>
        )}

        {screen === 'error' && (
          <div className="join-error">
            <div className="join-error-icon">⚠️</div>
            <h3>Submission Failed</h3>
            <p>Something went wrong. Your membership request was not submitted.</p>
            <button className="btn btn-primary" onClick={() => setScreen('form')}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}

function WhatsAppFloat() {
  return (
    <a href="https://wa.me/919876543210?text=Hi%20IronForge%20Gym!%20I%20want%20to%20know%20more%20about%20membership." className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 32 32" fill="white" width="28" height="28"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.25l6.14-1.982A15.91 15.91 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.316 22.602c-.39 1.098-1.93 2.01-3.15 2.27-.834.178-1.922.32-5.6-1.204-4.696-1.95-7.71-6.736-7.94-7.05-.224-.314-1.86-2.478-1.86-4.726 0-2.248 1.182-3.348 1.604-3.81.39-.428.934-.54 1.242-.54.31 0 .618.004.89.016.286.012.668-.108 1.04.794.39.95 1.334 3.246 1.45 3.484.116.238.194.514.038.828-.156.314-.234.51-.468.786-.234.276-.492.616-.702.828-.234.238-.478.494-.204.962.274.468 1.218 2.01 2.612 3.256 1.794 1.6 3.304 2.096 3.772 2.33.468.234.742.194 1.016-.118.274-.312 1.16-1.35 1.474-1.818.312-.468.626-.39 1.056-.234.434.156 2.744 1.294 3.216 1.53.468.238.78.354.896.55.116.196.116 1.142-.274 2.24z"/></svg>
    </a>
  )
}

// ===== MAIN APP =====
export default function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  useScrollReveal()

  return (
    <>
      <Navbar onOpenBooking={() => setBookingOpen(true)} onOpenJoin={() => setJoinOpen(true)} />
      <Hero onOpenBooking={() => setBookingOpen(true)} />
      <Membership />
      <Trainers />
      <Gallery />
      <BMICalculator />
      <Footer />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <JoinModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
      <WhatsAppFloat />
    </>
  )
}
