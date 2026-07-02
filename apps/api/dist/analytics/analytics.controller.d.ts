import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getMetrics(): {
        totalReturn: number;
        annualizedReturn: number;
        maxDrawdown: number;
        sharpeRatio: number;
        volatility: number;
        bestPerformer: string;
        worstPerformer: string;
    };
    getHistory(days: string): {
        day: number;
        value: number;
        change: number;
    }[];
}
