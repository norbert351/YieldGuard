'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useYieldGuard } from '@/hooks/useYieldGuard';

export default function DepositModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { deposit, approve, getUserBalance } = useYieldGuard();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'idle' | 'approved' | 'depositing' | 'done'>('idle');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setStep('idle');
      setError('');
      setTxHash('');
      setBusy(false);
      getUserBalance().then(setUserBalance).catch(() => {});
    }
  }, [open, getUserBalance]);

  async function handleApprove() {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter an amount');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await approve(amount);
      setStep('approved');
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Approve failed');
    }
    setBusy(false);
  }

  async function handleDeposit() {
    setError('');
    setBusy(true);
    setStep('depositing');
    try {
      const receipt = await deposit(amount);
      setTxHash(receipt?.hash || '');
      setStep('done');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Deposit failed');
      setStep('approved');
    }
    setBusy(false);
  }

  if (!open) return null;

  const insuf = parseFloat(amount || '0') > parseFloat(userBalance);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className="rounded-2xl border border-white/10 bg-surface-900 p-6 shadow-2xl shadow-black/50">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight">Deposit USDC</h3>
              <p className="mt-0.5 text-xs text-surface-400">Mint vault shares against your deposit</p>
            </div>
            <button
              onClick={onClose}
              disabled={busy}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-800 text-surface-400 transition-all hover:rotate-90 hover:bg-surface-700 hover:text-white disabled:opacity-30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 text-xs text-surface-400">
            Balance:{' '}
            <span className="font-mono text-white">
              {parseFloat(userBalance).toLocaleString()} USDC
            </span>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={step !== 'idle' || busy}
              className="w-full rounded-xl border border-white/10 bg-surface-800 py-3 pl-7 pr-16 text-sm transition-colors focus:border-brand-500/50 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => setAmount(userBalance)}
              disabled={step !== 'idle' || busy}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-400 transition-colors hover:bg-brand-500/25 disabled:opacity-30"
            >
              MAX
            </button>
          </div>

          {insuf && <p className="mb-3 text-xs text-error">Insufficient USDC balance</p>}
          {error && <p className="mb-3 text-xs text-error">{error}</p>}

          <div className="mb-5 flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                step !== 'idle' ? 'bg-success text-white' : 'bg-surface-700 text-surface-400'
              }`}
            >
              {step !== 'idle' ? <Check className="h-3.5 w-3.5" /> : '1'}
            </div>
            <div className="h-px flex-1 bg-surface-700" />
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                step === 'depositing' || step === 'done'
                  ? 'bg-success text-white'
                  : step === 'approved'
                    ? 'border border-brand-500/30 bg-brand-500/15 text-brand-400'
                    : 'bg-surface-700 text-surface-400'
              }`}
            >
              {step === 'done' ? <Check className="h-3.5 w-3.5" /> : '2'}
            </div>
          </div>

          {busy && step === 'approved' && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-surface-800/50 p-3 text-sm text-surface-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
              Depositing into vault…
            </div>
          )}
          {step === 'done' && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
              Deposit successful
              {txHash && (
                <span className="break-all font-mono text-[10px] text-surface-500">
                  TX: {txHash.slice(0, 10)}…
                </span>
              )}
            </div>
          )}

          {step === 'idle' && (
            <button
              onClick={handleApprove}
              disabled={busy || !amount || parseFloat(amount) <= 0 || insuf}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? 'Approving…' : 'Step 1 · Approve USDC'}
            </button>
          )}
          {step === 'approved' && (
            <button
              onClick={handleDeposit}
              disabled={busy}
              className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? 'Depositing…' : 'Step 2 · Deposit into vault'}
            </button>
          )}
          {step === 'done' && (
            <div className="w-full rounded-xl bg-success/10 py-3 text-center text-sm font-medium text-success">
              Complete
            </div>
          )}

          <p className="mt-3 text-center text-[10px] text-surface-500">
            Two steps: approve spending, then deposit into the vault
          </p>
        </div>
      </div>
    </>
  );
}
