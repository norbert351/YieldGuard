import { BlockchainService } from './blockchain.service';
export declare class BlockchainController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    getStatus(): {
        connected: boolean;
    };
    getVault(address: string): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
        healthFactor: string;
        sharePrice: string;
    } | null>;
    deposit(address: string, body: {
        amount: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
    }>;
    withdraw(address: string, body: {
        shares: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
    }>;
    getBalance(address: string, user: string): Promise<string | null>;
}
