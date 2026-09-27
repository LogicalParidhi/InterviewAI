import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode: 'popup' }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: 'continue_with'; shape: 'rectangular'; logo_alignment: 'left' }) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton = ({ onCredential, disabled = false }: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [buttonWidth, setButtonWidth] = useState(344);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    const render = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => onCredential(credential),
        ux_mode: 'popup',
      });
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: buttonWidth,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google) render();
    else if (existingScript) existingScript.addEventListener('load', render, { once: true });
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }
  }, [buttonWidth, clientId, onCredential]);

  useEffect(() => {
    if (!buttonRef.current) return;
    const updateWidth = () => setButtonWidth(Math.floor(buttonRef.current?.clientWidth || 344));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  if (!clientId) {
    return (
      <div className="w-full">
        <button type="button" disabled className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-semibold text-slate-700 opacity-60">
          <GoogleMark />
          Continue with Google
        </button>
        <p className="mt-2 text-center text-xs text-amber-400">Google sign-in setup is pending.</p>
      </div>
    );
  }

  return <div className={`w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`} ref={buttonRef} />;
};

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.3c2-1.8 3-4.4 3-7.4Z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a6 6 0 0 1-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.4 14A6 6 0 0 1 6 12c0-.7.1-1.4.4-2V7.4H3A10 10 0 0 0 3 16.6L6.4 14Z" />
    <path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 3 7.4L6.4 10A6 6 0 0 1 12 5.9Z" />
  </svg>
);

export default GoogleSignInButton;
