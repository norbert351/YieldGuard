import { OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
export declare class BlockchainService implements OnModuleInit {
    private vaultAbi;
    onModuleInit(): Promise<void>;
    private getConfig;
    getProvider(network?: string): Promise<ethers.JsonRpcProvider>;
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
        allocation: string;
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
    addStrategy(vaultAddress: string, strategyAddress: string, network?: string): Promise<{
        txHash: any;
        blockNumber: any;
        strategy: string;
        network: string;
    }>;
    allocateToStrategy(vaultAddress: string, strategyAddress: string, amount: string, network?: string): Promise<{
        txHash: any;
        blockNumber: any;
        strategy: string;
        amount: string;
        network: string;
    }>;
    harvestAll(vaultAddress: string, network?: string): Promise<{
        txHash: any;
        blockNumber: any;
        network: string;
    }>;
    getStrategies(vaultAddress: string, network?: string): Promise<{
        address: string;
        allocated: string;
    }[]>;
}
