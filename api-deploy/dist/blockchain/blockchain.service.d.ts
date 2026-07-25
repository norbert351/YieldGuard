import { OnModuleInit } from '@nestjs/common';
export declare class BlockchainService implements OnModuleInit {
    private vaultAbi;
    onModuleInit(): Promise<void>;
    private getConfig;
    private getProvider;
    private getSigner;
    isConnected(): Promise<boolean>;
    getVaultInfo(vaultAddress: string, network?: string): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
        sharePrice: string;
    } | null>;
    depositToVault(vaultAddress: string, amount: string, network?: string): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    withdrawFromVault(vaultAddress: string, shares: string, network?: string): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    getUserBalance(vaultAddress: string, userAddress: string, network?: string): Promise<{
        address: string;
        balance: string;
        network: string;
    }>;
}
