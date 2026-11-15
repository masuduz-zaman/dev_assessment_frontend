'use client';

import { useQuery } from '@tanstack/react-query';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '../api';

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

interface GoogleButtonProps {
  onCredential: (idToken: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

/** "Continue with Google" using Google Identity Services. The client id is served by the backend config endpoint. */
export function GoogleButton({ onCredential, text = 'continue_with' }: GoogleButtonProps) {
  const { data, isLoading } = useQuery({ queryKey: ['google-config'], queryFn: authApi.googleConfig, staleTime: Infinity });
  const container = useRef<HTMLDivElement>(null);
  const handler = useRef(onCredential);
  handler.current = onCredential;
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.google?.accounts) setScriptReady(true);
  }, []);

  useEffect(() => {
    if (!scriptReady || !data?.enabled || !data.clientId || !container.current || !window.google) return;
    window.google.accounts.id.initialize({ client_id: data.clientId, callback: (response) => handler.current(response.credential) });
    window.google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', shape: 'pill', text, width: Math.min(container.current.offsetWidth || 320, 400) });
  }, [scriptReady, data, text]);

  if (isLoading) return <div className="h-11 animate-pulse rounded-full bg-slate-100" />;

  if (!data?.enabled) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-center text-xs text-slate-500">
        Google sign-in is not configured yet. Set <code className="font-semibold">GOOGLE_CLIENT_ID</code> in the backend <code>.env</code>.
      </div>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setScriptReady(true)} />
      <div ref={container} className="flex min-h-11 w-full justify-center" />
    </>
  );
}
