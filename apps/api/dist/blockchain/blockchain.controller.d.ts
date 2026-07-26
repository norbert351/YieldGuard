import { BlockchainService } from './blockchain.service';
export declare class BlockchainController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    getStatus(): Promise<{
        connected: boolean;
    }>;
    getVault(address: string, body?: any): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
        sharePrice: string;
    } | null>;
    getBalance(address: string, user: string, body?: any): Promise<{
        address: string;
        balance: string;
        network: string;
    }>;
}
