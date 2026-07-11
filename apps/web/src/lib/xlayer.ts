export const XLAYER_TESTNET = {
  chainId: 1952,
  chainIdHex: '0x7a0',
  chainName: 'X Layer Testnet',
  nativeCurrency: {
    name: 'OKB',
    symbol: 'OKB',
    decimals: 18,
  },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://testscan.xlayer.tech'],
} as const;

export const SUPPORTED_CHAIN_IDS = [1952, 196] as const;

export function isSupportedYieldGuardChain(chainId?: number | null) {
  return typeof chainId === 'number' && SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number]);
}
