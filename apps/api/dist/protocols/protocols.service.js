"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolsService = void 0;
const common_1 = require("@nestjs/common");
let ProtocolsService = class ProtocolsService {
    constructor() {
        this.protocols = [
            { id: 'aave', name: 'Aave V3', color: '#7B5FED', tvl: '12.4B', supportedAssets: 5 },
            { id: 'morpho', name: 'Morpho', color: '#4F7BF5', tvl: '8.1B', supportedAssets: 4 },
            { id: 'compound', name: 'Compound', color: '#51CF66', tvl: '3.2B', supportedAssets: 3 },
        ];
        this.rates = [
            { asset: 'USDC', aave: 6.2, morpho: 8.9, compound: 5.4 },
            { asset: 'USDT', aave: 5.8, morpho: 8.2, compound: 5.1 },
            { asset: 'DAI', aave: 5.5, morpho: 7.8, compound: 4.9 },
            { asset: 'WETH', aave: 4.1, morpho: 5.2, compound: 3.8 },
            { asset: 'WBTC', aave: 3.2, morpho: 4.5, compound: 2.9 },
        ];
    }
    getAll() {
        return this.protocols;
    }
    getRates() {
        return this.rates.map((r) => ({
            ...r,
            best: this.findBest(r),
        }));
    }
    findBest(rates) {
        const max = Math.max(rates.aave, rates.morpho, rates.compound);
        if (max === rates.morpho)
            return 'Morpho';
        if (max === rates.aave)
            return 'Aave V3';
        return 'Compound';
    }
};
exports.ProtocolsService = ProtocolsService;
exports.ProtocolsService = ProtocolsService = __decorate([
    (0, common_1.Injectable)()
], ProtocolsService);
//# sourceMappingURL=protocols.service.js.map