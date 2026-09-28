import Link from 'next/link';

const orderUrl = process.env.NEXT_PUBLIC_ORDER_ONLINE_URL || 'https://www.foodbooking.com/ordering/restaurant/menu?company_uid=1043e827-9814-44dc-bcdf-5e2a572b1ad2&restaurant_uid=203d05b1-9d96-4b0e-ad12-f1178ebbce42';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark">FOODIE ZONE</Link>
        <nav className="header-actions">
          <Link href="/menu" className="nav-link">Menu</Link>
          <Link href="/rewards" className="nav-link">Rewards</Link>
          <Link href="/login" className="nav-link">Log in</Link>
          <a href={orderUrl} className="button button-pink">Order Online</a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">FOODIE ZONE</div>
          <h1>Good food.<br /><span>Good times.</span></h1>
          <p className="hero-lead">Order your favourites, manage your Foodie Zone account and earn rewards every time you spend.</p>
          <div className="hero-actions">
            <a href={orderUrl} className="button button-pink button-large">Order Online</a>
            <Link href="/rewards" className="button button-outline button-large">Foodie Zone Rewards</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-label">FOODIE ZONE</div>
          <div className="panel-line" />
          <div className="panel-main">EAT. ENJOY.<br />EARN.</div>
          <div className="panel-sub">YOUR FOODIE ZONE ACCOUNT</div>
          <div className="panel-footer"><span>MENU</span><span>REWARDS</span></div>
        </div>
      </section>

      <section className="landing-strip">
        <div><strong>Menu</strong><span>Browse Foodie Zone favourites.</span><Link href="/menu" className="text-link">View menu</Link></div>
        <div><strong>Rewards</strong><span>Earn points and redeem rewards.</span><Link href="/rewards" className="text-link">Open rewards</Link></div>
        <div><strong>Your account</strong><span>Keep your member details in one place.</span><Link href="/login" className="text-link">Log in</Link></div>
      </section>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Foodie Zone</span><span>Foodie Zone Rewards</span></footer>
    </main>
  );
}
