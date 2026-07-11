export default function ErrorPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#1a1a20', marginBottom: '1rem' }}>404</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page not found</h2>
        <p style={{ color: '#91919f', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#ee7f1a', color: '#fff', padding: '0.625rem 1.25rem',
          borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500,
          textDecoration: 'none',
        }}>Go home</a>
      </div>
    </div>
  );
}
