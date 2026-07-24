"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
const common_1 = require("@nestjs/common");
let SimulationService = class SimulationService {
    constructor() {
        this.simulations = [];
    }
    findAll() {
        return this.simulations;
    }
    run(config) {
        const simulation = {
            id: `SIM-${String(this.simulations.length + 1).padStart(3, '0')}`,
            config,
            status: 'completed',
            results: this.generateResults(config),
            createdAt: new Date().toISOString(),
        };
        this.simulations.push(simulation);
        return simulation;
    }
    generateResults(config) {
        const riskMultiplier = { Conservative: 0.08, Moderate: 0.15, Aggressive: 0.25 };
        const marketMultiplier = { 'Bull Market': 1.5, 'Bear Market': 0.5, Volatile: 0.8, Normal: 1.0 };
        const baseReturn = (riskMultiplier[config.risk] || 0.08) *
            (marketMultiplier[config.market] || 1.0) *
            (config.duration / 365);
        const finalValue = config.capital * (1 + baseReturn);
        const totalReturn = ((finalValue - config.capital) / config.capital) * 100;
        const drawdownMap = { Conservative: -2.0, Moderate: -4.0, Aggressive: -7.0 };
        const maxDrawdown = drawdownMap[config.risk] || -3.0;
        const sharpeMap = { Conservative: 2.5, Moderate: 1.8, Aggressive: 1.2 };
        const sharpeRatio = sharpeMap[config.risk] || 1.5;
        const volMap = { Conservative: 0.5, Moderate: 1.2, Aggressive: 2.5 };
        const volatility = volMap[config.risk] || 1.0;
        return {
            finalValue: Math.round(finalValue * 100) / 100,
            totalReturn: Math.round(totalReturn * 100) / 100,
            annualizedReturn: Math.round(((totalReturn / config.duration) * 365) * 100) / 100,
            maxDrawdown,
            sharpeRatio,
            volatility,
        };
    }
};
exports.SimulationService = SimulationService;
exports.SimulationService = SimulationService = __decorate([
    (0, common_1.Injectable)()
], SimulationService);
//# sourceMappingURL=simulation.service.js.map