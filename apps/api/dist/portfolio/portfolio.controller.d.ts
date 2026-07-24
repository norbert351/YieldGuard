import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getOverview(): Promise<{
        status: string;
        message: string;
        totalValue?: undefined;
        sharePrice?: undefined;
        healthFactor?: undefined;
        vaultName?: undefined;
        asset?: undefined;
    } | {
        totalValue: number;
        sharePrice: number;
        healthFactor: number;
        vaultName: any;
        asset: any;
        status: string;
        message?: undefined;
    }>;
    getPositions(): Promise<({
        protocol: any;
        asset: any;
        deposited: number;
        apy: number;
        healthFactor: number;
        status: string;
    } | null)[]>;
}
