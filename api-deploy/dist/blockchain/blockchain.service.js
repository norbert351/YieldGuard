"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
let BlockchainService = class BlockchainService {
    constructor() {
        this.vaultAbi = [
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
        ];
    }
    async onModuleInit() {
        console.log('Blockchain service initialized (lazy connect)');
    }
    getConfig(network) {
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
    async getProvider(network) {
        const { rpcUrl } = this.getConfig(network);
        return new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    }
    async getSigner(network) {
        const { rpcUrl, privateKey } = this.getConfig(network);
        if (!privateKey)
            throw new Error('Wallet PK not set — set YIELDGUARD_WALLET_PK env var');
        const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        return new ethers_1.ethers.Wallet(privateKey, provider);
    }
    async isConnected() {
        try {
            const provider = await this.getProvider();
            await provider.getBlockNumber();
            return true;
        }
        catch {
            return false;
        }
    }
    async getVaultInfo(vaultAddress, network) {
        const provider = await this.getProvider(network);
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, provider);
        try {
            const [name, asset, totalAssets, totalShares] = await Promise.all([
                c.vaultName(), c.asset(), c.totalAssets_(), c.totalShares(),
            ]);
            return {
                address: vaultAddress, name, asset,
                totalAssets: ethers_1.ethers.formatEther(totalAssets),
                totalShares: ethers_1.ethers.formatEther(totalShares),
                sharePrice: totalShares > 0n ? ethers_1.ethers.formatEther((totalAssets * 10n ** 18n) / totalShares) : '1.0',
            };
        }
        catch {
            return null;
        }
    }
    async depositToVault(vaultAddress, amount, network) {
        const signer = await this.getSigner(network);
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, signer);
        const tx = await c.deposit(ethers_1.ethers.parseEther(amount));
        const r = await tx.wait();
        return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
    }
    async withdrawFromVault(vaultAddress, shares, network) {
        const signer = await this.getSigner(network);
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, signer);
        const tx = await c.withdraw(ethers_1.ethers.parseEther(shares));
        const r = await tx.wait();
        return { txHash: r.hash, blockNumber: r.blockNumber, network: network || 'mainnet' };
    }
    async getUserBalance(vaultAddress, userAddress, network) {
        const provider = await this.getProvider(network);
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, provider);
        const bal = ethers_1.ethers.formatEther(await c.balances(userAddress));
        return { address: userAddress, balance: bal, network: network || 'mainnet' };
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)()
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map