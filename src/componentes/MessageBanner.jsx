import './MessageBanner.css';

function MessageBanner({ type = 'info', children }) {
  if (!children) {
    return null;
  }

  return (
    <div className={`message-banner message-banner--${type}`} role="alert" aria-live="polite">
      {children}
    </div>
  );
}

export default MessageBanner;