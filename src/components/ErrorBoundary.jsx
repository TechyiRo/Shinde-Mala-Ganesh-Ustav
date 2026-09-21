import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('mandal_status_data');
      localStorage.removeItem('mandal_events_data');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #180812 0%, #0d0208 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <img
            src="/logo.png"
            alt="गणेश उत्सव"
            style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)' }}
          />
          <h2 style={{ fontSize: '1.5rem', color: '#fbbf24', margin: '0 0 0.5rem' }}>
            ॥ श्री गणेशाय नमः ॥
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#ffedd5', maxWidth: '420px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            पेज लोड करताना काही अडचण आली आहे. खालील बटणावर क्लिक करून पेज रीफ्रेश करा.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: 'linear-gradient(135deg, #ff7722, #fbbf24)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              padding: '0.75rem 1.75rem',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(255, 119, 34, 0.4)'
            }}
          >
            🔄 पुन्हा लोड करा (Refresh Page)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
