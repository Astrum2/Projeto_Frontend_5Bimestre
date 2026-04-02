import { useEffect, useState } from 'react';
import './MessageBanner.css';

function MessageBanner({ type = 'info', children, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(!!children);

  useEffect(() => {
    if (children) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [children, duration]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`message-banner message-banner--${type}`} role="alert" aria-live="polite">
      {children}
    </div>
  );
}

export default MessageBanner;
