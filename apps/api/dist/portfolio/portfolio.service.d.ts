import { BlockchainService } from '../blockchain/blockchain.service';
export declare class PortfolioService {
    private readonly blockchain;
    constructor(blockchain: BlockchainService);
    getOverview(): Promise<{
        status: string;
        message: string;
        totalValue?: undefined;
        sharePrice?: undefined;
        vaultName?: undefined;
        asset?: undefined;
    } | {
        totalValue: number;
        sharePrice: number;
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
