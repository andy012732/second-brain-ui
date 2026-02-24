export default function PrivacyPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'Share Tech Mono, monospace', color: '#f8f8f2' }}>
      <h1 style={{ fontSize: '1.5rem', fontFamily: 'Orbitron, monospace', marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <p style={{ color: '#6272a4', fontSize: '0.75rem', marginBottom: '2rem' }}>Last updated: February 2026</p>
      <div style={{ lineHeight: 1.8, fontSize: '0.85rem', color: '#ccc' }}>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>1. Information We Collect</h2>
        <p>When you authorize your social media accounts, we access profile information, public statistics, and recent content metadata through official APIs.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>2. How We Use Your Information</h2>
        <p>Your data is used exclusively to display analytics on your personal dashboard.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>3. Data Storage</h2>
        <p>OAuth tokens are stored securely. Analytics data is fetched in real-time and is not permanently stored.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>4. Data Sharing</h2>
        <p>We do not sell, trade, or share your personal information with third parties.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>5. Third-Party APIs</h2>
        <p>We use official APIs from YouTube, Meta, and TikTok with their own privacy policies.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>6. Data Deletion</h2>
        <p>You can revoke access to any connected account at any time through the platform settings.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>7. Security</h2>
        <p>We implement industry-standard security measures including HTTPS encryption.</p>
        <h2 style={{ color: '#bd93f9', fontSize: '1rem', marginTop: '1.5rem' }}>8. Contact</h2>
        <p>For privacy inquiries, please contact us through our website.</p>
      </div>
    </div>
  );
}
