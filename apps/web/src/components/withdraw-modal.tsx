'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useYieldGuard } from '@/hooks/useYieldGuard';

export default function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { withdraw, getUserShares, getVaultData } = useYieldGuard();
  const [amount, setAmount] = useState('');
  const [userShares, setUserShares] = useState('0');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [done, setDone] = useState(false);
  const [sharePrice, setSharePrice] = useState('1');

  useEffect(() => {
    if (open) {
      setAmount('');
      setError('');
      setTxHash('');
      setDone(false);
      setBusy(false);
      getUserShares().then(setUserShares).catch(() => {});
      getVaultData()
        .then((d) => {
          if (d) setSharePrice(d.vault.sharePrice);
        })
        .catch(() => {});
    }
  }, [open, getUserShares, getVaultData]);

  async function handleWithdraw() {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter an amount');
      return;
    }
    const shares = (parseFloat(amount) / parseFloat(sharePrice)).toFixed(18);
    if (parseFloat(shares) > parseFloat(userShares)) {
      setError('Insufficient vault balance');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const receipt = await withdraw(shares);
      setTxHash(receipt?.hash || '');
      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'Withdraw failed');
    }
    setBusy(false);
  }

  if (!open) return null;

  const vaultBalanceUsd = (parseFloat(userShares) * parseFloat(sharePrice)).toFixed(2);
  const insuf = parseFloat(amount || '0') > parseFloat(vaultBalanceUsd);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className="rounded-2xl border border-white/10 bg-surface-900 p-6 shadow-2xl shadow-black/50">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight">Withdraw USDC</h3>
              <p className="mt-0.5 text-xs text-surface-400">Burn shares and redeem underlying</p>
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
            Vault balance:{' '}
            <span className="font-mono text-white">
              ${parseFloat(vaultBalanceUsd).toLocaleString()} USDC
            </span>
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={busy || done}
              className="w-full rounded-xl border border-white/10 bg-surface-800 py-3 pl-7 pr-16 text-sm transition-colors focus:border-brand-500/50 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => setAmount(vaultBalanceUsd)}
              disabled={busy || done}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-400 transition-colors hover:bg-brand-500/25 disabled:opacity-30"
            >
              MAX
            </button>
          </div>

          {insuf && <p className="mb-3 text-xs text-error">Insufficient vault balance</p>}
          {error && <p className="mb-3 text-xs text-error">{error}</p>}

          {busy && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-surface-800/50 p-3 text-sm text-surface-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
              Withdrawing…
            </div>
          )}
          {done && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
              Withdrawn successfully
              {txHash && (
                <span className="break-all font-mono text-[10px] text-surface-500">
                  TX: {txHash.slice(0, 10)}…
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={busy || done || !amount || parseFloat(amount) <= 0 || insuf}
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? 'Processing…' : done ? 'Complete' : 'Withdraw'}
          </button>
        </div>
      </div>
    </>
  );
}
