import { BlockchainService } from '../blockchain/blockchain.service';
export declare class AnalyticsService {
    private readonly blockchain;
    constructor(blockchain: BlockchainService);
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
    getHistory(days: number): Promise<{
        day: number;
        value: number;
        change: number;
    }[]>;
}
