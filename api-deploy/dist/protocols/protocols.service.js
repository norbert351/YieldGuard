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
exports.ProtocolsService = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("../blockchain/blockchain.service");
let ProtocolsService = class ProtocolsService {
    constructor(blockchain) {
        this.blockchain = blockchain;
    }
    async getAll() {
        const vaultAddress = process.env.VAULT_ADDRESS || '';
        if (!vaultAddress)
            return [];
        const provider = this.blockchain.getProvider();
        if (!provider)
            return [];
        try {
            const { ethers } = await Promise.resolve().then(() => require('ethers'));
            const vault = new ethers.Contract(vaultAddress, ['function getStrategies() view returns (address[])'], provider);
            const strategies = await vault.getStrategies();
            const stratAbi = ['function name() view returns (string)', 'function protocol() view returns (string)', 'function totalAssets() view returns (uint256)', 'function apy() view returns (uint256)'];
            const protocols = await Promise.all(strategies.map(async (addr) => {
                try {
                    const s = new ethers.Contract(addr, stratAbi, provider);
                    const [name, protocol] = await Promise.all([s.name(), s.protocol()]);
                    return { id: protocol.toLowerCase().replace(/\s+/g, ''), name: protocol, address: addr, supportedAssets: 1 };
                }
                catch {
                    return null;
                }
            }));
            return protocols.filter(Boolean);
        }
        catch {
            return [];
        }
    }
    async getRates() {
        const vaultAddress = process.env.VAULT_ADDRESS || '';
        if (!vaultAddress)
            return [];
        const provider = this.blockchain.getProvider();
        if (!provider)
            return [];
        try {
            const { ethers } = await Promise.resolve().then(() => require('ethers'));
            const vault = new ethers.Contract(vaultAddress, ['function getStrategies() view returns (address[])'], provider);
            const strategies = await vault.getStrategies();
            const stratAbi = ['function protocol() view returns (string)', 'function apy() view returns (uint256)'];
            const rates = await Promise.all(strategies.map(async (addr) => {
                try {
                    const s = new ethers.Contract(addr, stratAbi, provider);
                    const [protocol, apy] = await Promise.all([s.protocol(), s.apy()]);
                    const apyPct = parseFloat(ethers.formatEther(apy)) * 100;
                    return { asset: protocol, protocol: protocol, apy: apyPct };
                }
                catch {
                    return null;
                }
            }));
            return rates.filter(Boolean);
        }
        catch {
            return [];
        }
    }
};
exports.ProtocolsService = ProtocolsService;
exports.ProtocolsService = ProtocolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], ProtocolsService);
//# sourceMappingURL=protocols.service.js.map