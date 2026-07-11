export const deployedContracts = {
  xlayerTestnet: {
    chainId: 1952,
    factory: '0x4ec0f9CFCA28BbB7488F5eea668fEAe26a74898A',
    vault: '0xf23c35ac7489B7F19082128ed1915FB665a2e12D',
    aaveStrategy: '0x23d634f2d0e4a1a93c6a67143a0d2a0b9b8cc55d',
    morphoStrategy: '0x9B37245D51EcA1E1d2EEdd767A54dAb8b6286e3a',
    usdc: '0x0e0C1582cb5692b8E3616D9381381Ad8F029a8F9',
    usdcLabel: 'Mock USDC',
  },
  xlayerMainnet: {
    chainId: 196,
    factory: '',
    vault: '',
    aaveStrategy: '',
    morphoStrategy: '',
    usdc: '0x74b7F16337b8972027F6196A17a631aC6dE26d22',
    usdcLabel: 'USDC',
  },
} as const;

export type SupportedChain = keyof typeof deployedContracts;
