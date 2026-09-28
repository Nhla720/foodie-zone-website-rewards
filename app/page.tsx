
import Link from 'next/link';

const orderUrl =
  process.env.NEXT_PUBLIC_ORDER_ONLINE_URL ||
  'https://www.foodbooking.com/ordering/restaurant/menu?company_uid=1043e827-9814-44dc-bcdf-5e2a572b1ad2&restaurant_uid=203d05b1-9d96-4b0e-ad12-f1178ebbce42&facebook=true';

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="wordmark">
          FOODIE ZONE
        </Link>

        <nav className="header-actions">
          <Link href="/menu" className="nav-link">
            Menu
          </Link>
          <Link href="/rewards" className="nav-link">
            Rewards
          </Link>
          <Link href="/login" className="nav-link">
            Log in
          </Link>
          <a href={orderUrl} className="button button-pink">
            Order Online
          </a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">FOODIE ZONE</div>

          <h1>
            Thank You for
            <br />
            <span>Choosing Foodie Zone.</span>
          </h1>

          <p className="hero-lead">
            Enjoy your favourite meals, order online and earn rewards every
            time you spend with Foodie Zone.
          </p>

          <div className="hero-actions">
            <a href={orderUrl} className="button button-pink button-large">
              Order Online
            </a>
            <Link href="/rewards" className="button button-outline button-large">
              Foodie Zone Rewards
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Foodie Zone</span>
        <span>Foodie Zone Rewards</span>
      </footer>
    </main>
  );
}

