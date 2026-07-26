import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService implements OnModuleInit {

  private vaultAbi = [
    'function deposit(uint256 _amount) external returns (uint256)',
    'function withdraw(uint256 _shares) external returns (uint256)',
    'function balances(address) view returns (uint256)',
    'function totalAssets_() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function asset() view returns (address)',
    'function vaultName() view returns (string)',
    'function strategies(uint256) view returns (address)',
    'function strategyAllocation(address) view returns (uint256)',
    'function isStrategy(address) view returns (bool)',
    'function addStrategy(address _strategy) external',
    'function allocateToStrategy(address _strategy, uint256 _amount) external',
    'function harvestAll() external returns (uint256)',
    'function getStrategies() view returns (address[])',
    'function strategyCount() view returns (uint256)',
    'function sharePrice() view returns (uint256)',
    'function healthFactor() view returns (uint256)',
  ];

  async onModuleInit() {
    console.log('Blockchain service initialized (lazy connect)');
  }

  private getConfig(network?: string) {
    const isTestnet = network === 'testnet';
    const rpcUrl = isTestnet
      ? (process.env.TESTNET_RPC_URL || 'http://127.0.0.1:8545')
      : (process.env.MAINNET_RPC_URL || process.env.X_LAYER_RPC || process.env.RPC_URL || 'http://127.0.0.1:8545');
    const vaultAddress = isTestnet
      ? (process.env.TESTNET_VAULT_ADDRESS || '')
      : (process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '');
    const privateKey = process.env.YIELDGUARD_WALLET_PK || process.env.FOUNDRY_WALLET_PK || process.env.PRIVATE_KEY || '';
    return { rpcUrl, vaultAddress, privateKey, isTestnet };
  }

  async getProvider(network?: string) {
    const { rpcUrl } = this.getConfig(network);
    return new ethers.JsonRpcProvider(rpcUrl);
  }

  private async getSigner(network?: string) {
    const { rpcUrl, privateKey } = this.getConfig(network);
    if (!privateKey) throw new Error('Wallet PK not set — set YIELDGUARD_WALLET_PK env var');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
  }

  async isConnected(): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      await provider.getBlockNumber();
      return true;
    } catch { return false; }
  }

  async getVaultInfo(vaultAddress: string, network?: string) {
    const provider = await this.getProvider(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, provider);
    try {
      const [name, asset, totalAssets, totalShares] = await Promise.all([
        c.vaultName(), c.asset(), c.totalAssets_(), c.totalShares(),
      ]);
      return {
        address: vaultAddress, name, asset,
        totalAssets: ethers.formatEther(totalAssets),
        totalShares: ethers.formatEther(totalShares),
        sharePrice: totalShares > 0n ? ethers.formatEther((totalAssets * 10n ** 18n) / totalShares) : '1.0',
      };
    } catch { return null; }
  }

  async depositToVault(vaultAddress: string, amount: string, network?: string) {
    const signer = await this.getSigner(network);
    if (!signer) throw new Error('Wallet not configured');
    
    // Check gas balance
    const balance = await signer.provider!.getBalance(signer.address);
    if (balance === 0n) {
      return { error: 'wallet_unfunded', message: `Server wallet ${signer.address} has no gas. Send OKB to this address on ${network || 'mainnet'} to enable deposits.`, network: network || 'mainnet' };
    }

    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    // 0. Approve vault to spend USDC
    const asset = await c.asset();
    const erc20 = new ethers.Contract(asset, ['function approve(address,uint256) returns (bool)'], signer);
    await erc20.approve(vaultAddress, ethers.MaxUint256);
    
    // 1. Harvest any existing yield first
    try { await c.harvestAll(); } catch {}
    
    // 2. Deposit USDC — use USDC decimals (6) not ETH (18)
    const usdcDecimals = 6;
    const tx = await c.deposit(ethers.parseUnits(amount, usdcDecimals));
    const r = await tx.wait();
    
    // 3. Auto-allocate idle USDC to strategies (only if balance > 0)
    let allocation = 'none';
    try {
      const strats: string[] = await c.getStrategies();
      if (strats.length > 0) {
        const asset = await c.asset();
        const idleAbi = ['function balanceOf(address) view returns (uint256)'];
        const token = new ethers.Contract(asset, idleAbi, signer);
        const idleBalance = await token.balanceOf(vaultAddress);
        if (idleBalance > 0n) {
          const perStrategy = idleBalance / BigInt(strats.length);
          if (perStrategy > 0n) {
            for (const strat of strats) {
              if (await c.isStrategy(strat)) {
                try { await c.allocateToStrategy(strat, perStrategy.toString()); } catch {}
              }
            }
            allocation = `split across ${strats.length} strategies`;
          }
        }
      }
    } catch {}
    
    return { txHash: r.hash, blockNumber: r.blockNumber, allocation, network: network || 'mainnet' };
  }

  async withdrawFromVault(vaultAddress: string, shares: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.withdraw(ethers.parseUnits(shares, 6));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
  }

  async getUserBalance(vaultAddress: string, userAddress: string, network?: string) {
    const provider = await this.getProvider(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, provider);
    const bal = ethers.formatEther(await c.balances(userAddress));
    return { address: userAddress, balance: bal, network: network || 'mainnet' };
  }

  async addStrategy(vaultAddress: string, strategyAddress: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.addStrategy(strategyAddress);
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, strategy: strategyAddress, network: network || 'mainnet' };
  }

  async allocateToStrategy(vaultAddress: string, strategyAddress: string, amount: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.allocateToStrategy(strategyAddress, ethers.parseUnits(amount, 6));
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, strategy: strategyAddress, amount, network: network || 'mainnet' };
  }

  async harvestAll(vaultAddress: string, network?: string) {
    const signer = await this.getSigner(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, signer);
    const tx = await c.harvestAll();
    const r = await tx.wait();
    return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
  }

  async getStrategies(vaultAddress: string, network?: string) {
    const provider = await this.getProvider(network);
    const c = new ethers.Contract(vaultAddress, this.vaultAbi, provider);
    const addrs: string[] = await c.getStrategies();
    const info = await Promise.all(addrs.map(async (addr: string) => {
      const alloc = ethers.formatEther(await c.strategyAllocation(addr));
      return { address: addr, allocated: alloc };
    }));
    return info;
  }
}
