"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let PortfolioService = class PortfolioService {
    constructor(blockchain) {
        this.blockchain = blockchain;
    }
    async getOverview() {
        const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
        if (!vaultAddress) {
            return { status: 'unconfigured', message: 'Set VAULT_ADDRESS env var to read live data' };
        }
        try {
            const info = await this.blockchain.getVaultInfo(vaultAddress);
            if (!info)
                return { status: 'unavailable', message: 'Vault not found on chain' };
            return {
                totalValue: parseFloat(info.totalAssets),
                sharePrice: parseFloat(info.sharePrice),
                vaultName: info.name,
                asset: info.asset,
                status: 'healthy',
            };
        }
        catch {
            return { status: 'error', message: 'Failed to read blockchain data' };
        }
    }
    async getPositions() {
        const vaultAddress = process.env.MAINNET_VAULT_ADDRESS || process.env.VAULT_ADDRESS || '';
        if (!vaultAddress)
            return [];
        try {
            const info = await this.blockchain.getVaultInfo(vaultAddress);
            if (!info)
                return [];
            const provider = this.blockchain.getProvider();
            if (!provider)
                return [];
            const vaultAbi = ['function getStrategies() view returns (address[])', 'function strategyCount() view returns (uint256)'];
            const { ethers } = await Promise.resolve().then(() => require('ethers'));
            const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
            const strategies = await vault.getStrategies();
            const positions = await Promise.all(strategies.map(async (addr) => {
                const stratAbi = ['function name() view returns (string)', 'function protocol() view returns (string)', 'function totalAssets() view returns (uint256)', 'function apy() view returns (uint256)', 'function healthFactor() view returns (uint256)', 'function isHealthy() view returns (bool)'];
                const s = new ethers.Contract(addr, stratAbi, provider);
                try {
                    const [name, protocol, totalAsset, apy, hf] = await Promise.all([s.name(), s.protocol(), s.totalAssets(), s.apy(), s.healthFactor()]);
                    return {
                        protocol,
                        asset: info.asset,
                        deposited: parseFloat(ethers.formatEther(totalAsset)),
                        apy: parseFloat(ethers.formatEther(apy)) * 100,
                        healthFactor: parseFloat(ethers.formatEther(hf)),
                        status: 'Active',
                    };
                }
                catch {
                    return null;
                }
            }));
            return positions.filter(Boolean);
        }
        catch {
            return [];
        }
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map