"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
let PortfolioService = class PortfolioService {
    constructor() {
        this.positions = [
            { protocol: 'Aave V3', asset: 'USDC', deposited: 50000, apy: 6.2, healthFactor: 2.8, status: 'Active' },
            { protocol: 'Morpho', asset: 'USDC', deposited: 35000, apy: 8.9, healthFactor: 3.1, status: 'Active' },
            { protocol: 'Compound', asset: 'DAI', deposited: 25000, apy: 5.4, healthFactor: 2.5, status: 'Active' },
            { protocol: 'Aave V3', asset: 'WETH', deposited: 14582, apy: 4.1, healthFactor: 2.2, status: 'Active' },
        ];
    }
    getOverview() {
        const totalValue = this.positions.reduce((sum, p) => sum + p.deposited, 0);
        const avgApy = this.positions.reduce((sum, p) => sum + p.apy, 0) / this.positions.length;
        const minHealth = Math.min(...this.positions.map((p) => p.healthFactor));
        const protocols = [...new Set(this.positions.map((p) => p.protocol))];
        return {
            totalValue: Math.round(totalValue * 100) / 100,
            avgApy: Math.round(avgApy * 100) / 100,
            activeProtocols: protocols.length,
            healthFactor: Math.round(minHealth * 10) / 10,
            status: 'healthy',
        };
    }
    getPositions() {
        return this.positions;
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)()
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map