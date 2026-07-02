export declare class PortfolioService {
    private positions;
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
