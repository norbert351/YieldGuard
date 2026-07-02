import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getOverview(): {
        totalValue: number;
        avgApy: number;
        activeProtocols: number;
        healthFactor: number;
        status: string;
    };
    getPositions(): {
        protocol: string;
        asset: string;
        deposited: number;
        apy: number;
        healthFactor: number;
        status: string;
    }[];
}
