import { BlockchainService } from './blockchain.service';
export declare class VaultPostController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    postVault(address: string, body: any): Promise<any>;
    deposit(address: string, body: {
        amount: string;
        network?: string;
    }): Promise<any>;
    withdraw(address: string, body: {
        shares: string;
        network?: string;
    }): Promise<any>;
    postBalance(address: string, user: string, body: any): Promise<any>;
    addStrategy(address: string, body: {
        strategy: string;
        network?: string;
    }): Promise<any>;
    allocate(address: string, body: {
        strategy: string;
        amount: string;
        network?: string;
    }): Promise<any>;
    harvest(address: string, body: any): Promise<any>;
    strategies(address: string, body: any): Promise<any>;
}
