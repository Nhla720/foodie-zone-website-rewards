import Link from 'next/link';

export default function Home() {
  const order = process.env.NEXT_PUBLIC_ORDER_ONLINE_URL || 'https://www.foodbooking.com/ordering/restaurant/menu?company_uid=1043e827-9814-44dc-bcdf-5e2a572b1ad2&restaurant_uid=203d05b1-9d96-4b0e-ad12-f1178ebbce42&facebook=true';

  return (
    <main className="landing">
      <header className="site-header">
        <Link href="/" className="wordmark">FOODIE ZONE <span>REWARDS</span></Link>
        <nav className="header-actions">
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/register" className="button button-pink">Join Rewards</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">FOODIE ZONE REWARDS</div>
          <h1>Good food.<br /><span>More rewards.</span></h1>
          <p className="hero-lead">
            Your Foodie Zone account keeps your rewards, points and member QR code in one place.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="button button-pink button-large">Create your account</Link>
            <a href={order} className="button button-outline button-large">Order online</a>
          </div>
          <p className="hero-note">Already a member? <Link href="/login">Log in to your account</Link></p>
        </div>

        <div className="hero-panel">
          <div className="panel-label">MEMBER ACCOUNT</div>
          <div className="panel-line"></div>
          <div className="panel-main">FOODIE ZONE</div>
          <div className="panel-sub">REWARDS MEMBER</div>
          <div className="panel-footer">
            <span>POINTS &amp; REWARDS</span>
            <span>MEMBER QR</span>
          </div>
        </div>
      </section>

      <section className="landing-strip">
        <div><strong>Rewards</strong><span>Access your available rewards</span></div>
        <div><strong>Points</strong><span>Track points from purchases</span></div>
        <div><strong>Member QR</strong><span>Use your account when redeeming</span></div>
      </section>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Foodie Zone Rewards</span>
        <span>Foodie Zone</span>
      </footer>
    </main>
  );
}
