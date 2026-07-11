'use client';

import dynamic from 'next/dynamic';

const WalletConnectInner = dynamic(() => import('./wallet-connect-inner'), { ssr: false });

export function WalletConnect() { return <WalletConnectInner />; }
