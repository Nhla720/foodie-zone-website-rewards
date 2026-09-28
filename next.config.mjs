/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // The in-site cart/checkout were removed: ordering happens on FoodBooking.
    return [
      { source: '/cart', destination: '/menu', permanent: false },
      { source: '/checkout', destination: '/menu', permanent: false },
    ];
  },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }, { key: 'Service-Worker-Allowed', value: '/' }] }];
  },
};
export default nextConfig;
