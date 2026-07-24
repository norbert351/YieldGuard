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
        this.provider = null;
        this.signer = null;
        this.vaultAbi = [
            'function deposit(uint256 _amount) external returns (uint256)',
            'function withdraw(uint256 _shares) external returns (uint256)',
            'function balanceOf(address _user) view returns (uint256)',
            'function totalAssets() view returns (uint256)',
            'function totalShares() view returns (uint256)',
            'function sharePrice() view returns (uint256)',
            'function healthFactor() view returns (uint256)',
            'function asset() view returns (address)',
            'function vaultName() view returns (string)',
            'function getStrategies() view returns (address[])',
        ];
    }
    async onModuleInit() {
        const rpcUrl = process.env.MAINNET_RPC_URL || process.env.X_LAYER_RPC || process.env.RPC_URL || 'http://127.0.0.1:8545';
        const privateKey = process.env.PRIVATE_KEY || '';
        try {
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            if (privateKey)
                this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
            console.log(`Blockchain provider: ${rpcUrl}`);
        }
        catch {
            console.warn('Blockchain unavailable (simulation mode)');
        }
    }
    isConnected() { return this.provider !== null; }
    getProvider() { return this.provider; }
    async getVaultInfo(vaultAddress) {
        if (!this.provider)
            return null;
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, this.provider);
        try {
            const [name, asset, totalAssets, totalShares, hf] = await Promise.all([
                c.vaultName(), c.asset(), c.totalAssets(), c.totalShares(), c.healthFactor(),
            ]);
            return {
                address: vaultAddress, name, asset,
                totalAssets: ethers_1.ethers.formatEther(totalAssets),
                totalShares: ethers_1.ethers.formatEther(totalShares),
                healthFactor: ethers_1.ethers.formatEther(hf),
                sharePrice: totalShares > 0n ? ethers_1.ethers.formatEther((totalAssets * 10n ** 18n) / totalShares) : '1.0',
            };
        }
        catch {
            return null;
        }
    }
    async depositToVault(vaultAddress, amount) {
        if (!this.signer)
            throw new Error('Signer not initialized');
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, this.signer);
        const tx = await c.deposit(ethers_1.ethers.parseEther(amount));
        const r = await tx.wait();
        return { txHash: r.hash, blockNumber: r.blockNumber };
    }
    async withdrawFromVault(vaultAddress, shares) {
        if (!this.signer)
            throw new Error('Signer not initialized');
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, this.signer);
        const tx = await c.withdraw(ethers_1.ethers.parseEther(shares));
        const r = await tx.wait();
        return { txHash: r.hash, blockNumber: r.blockNumber };
    }
    async getUserBalance(vaultAddress, userAddress) {
        if (!this.provider)
            return null;
        const c = new ethers_1.ethers.Contract(vaultAddress, this.vaultAbi, this.provider);
        return ethers_1.ethers.formatEther(await c.balanceOf(userAddress));
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = __decorate([
    (0, common_1.Injectable)()
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map