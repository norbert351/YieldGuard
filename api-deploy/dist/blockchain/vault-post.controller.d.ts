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
        allocation: string;
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
    addStrategy(address: string, body: {
        strategy: string;
        network?: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
        strategy: string;
        network: string;
    }>;
    allocate(address: string, body: {
        strategy: string;
        amount: string;
        network?: string;
    }): Promise<{
        txHash: any;
        blockNumber: any;
        strategy: string;
        amount: string;
        network: string;
    }>;
    harvest(address: string, body: any): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    strategies(address: string, body: any): Promise<{
        address: string;
        allocated: string;
    }[]>;
}
