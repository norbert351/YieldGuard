"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
let AnalyticsService = class AnalyticsService {
    getMetrics() {
        return {
            totalReturn: 22.5,
            annualizedReturn: 45.6,
            maxDrawdown: -3.2,
            sharpeRatio: 2.1,
            volatility: 0.8,
            bestPerformer: 'Morpho',
            worstPerformer: 'Compound',
        };
    }
    getHistory(days) {
        const data = [];
        let value = 10000;
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.48) * 200;
            value += change;
            data.push({
                day: i + 1,
                value: Math.round(value * 100) / 100,
                change: Math.round(change * 100) / 100,
            });
        }
        return data;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)()
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map