import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getMetrics(): Promise<{
        status: string;
        message: string;
        totalReturn?: undefined;
        annualizedReturn?: undefined;
        harvestCount?: undefined;
        vaultName?: undefined;
        sharePrice?: undefined;
        healthFactor?: undefined;
    } | {
        status: string;
        message?: undefined;
        totalReturn?: undefined;
        annualizedReturn?: undefined;
        harvestCount?: undefined;
        vaultName?: undefined;
        sharePrice?: undefined;
        healthFactor?: undefined;
    } | {
        totalReturn: number;
        annualizedReturn: number;
        harvestCount: number;
        vaultName: any;
        sharePrice: number;
        healthFactor: number;
        status?: undefined;
        message?: undefined;
    }>;
    getHistory(days: string): Promise<{
        day: number;
        value: number;
        change: number;
    }[]>;
}
