import { BlockchainService } from './blockchain.service';
export declare class VaultPostController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    postVault(address: string): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
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
    postBalance(address: string, user: string): Promise<string | null>;
}
