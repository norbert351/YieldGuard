export declare class AnalyticsService {
    getMetrics(): {
        totalReturn: number;
        annualizedReturn: number;
        maxDrawdown: number;
        sharpeRatio: number;
        volatility: number;
        bestPerformer: string;
        worstPerformer: string;
    };
    getHistory(days: number): {
        day: number;
        value: number;
        change: number;
    }[];
}
