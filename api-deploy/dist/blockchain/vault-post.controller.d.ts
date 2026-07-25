import { BlockchainService } from './blockchain.service';
export declare class VaultPostController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    postVault(address: string, body: any): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
        sharePrice: string;
    } | null>;
    deposit(address: string, body: {
        amount: string;
        network?: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    withdraw(address: string, body: {
        shares: string;
        network?: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    postBalance(address: string, user: string, body: any): Promise<{
        address: string;
        balance: string;
        network: string;
    }>;
}
