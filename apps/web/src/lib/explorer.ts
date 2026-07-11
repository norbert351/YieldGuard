const EXPLORERS: Record<number, string> = {
  1952: 'https://testscan.xlayer.tech',
  196: 'https://scan.xlayer.tech',
};

export function explorerTx(chainId: number, txHash: string): string {
  const base = EXPLORERS[chainId] || EXPLORERS[1952];
  return `${base}/tx/${txHash}`;
}

export function explorerAddress(chainId: number, address: string): string {
  const base = EXPLORERS[chainId] || EXPLORERS[1952];
  return `${base}/address/${address}`;
}
