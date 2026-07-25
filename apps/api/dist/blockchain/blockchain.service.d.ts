import { OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
export declare class BlockchainService implements OnModuleInit {
    private provider;
    private signer;
    private vaultAbi;
    onModuleInit(): Promise<void>;
    isConnected(): boolean;
    getProvider(): ethers.JsonRpcProvider | null;
    getVaultInfo(vaultAddress: string): Promise<{
        address: string;
        name: any;
        asset: any;
        totalAssets: string;
        totalShares: string;
        sharePrice: string;
    } | null>;
    depositToVault(vaultAddress: string, amount: string): Promise<{
        txHash: any;
        blockNumber: any;
    }>;
    withdrawFromVault(vaultAddress: string, shares: string): Promise<{
        txHash: any;
        blockNumber: any;
    }>;
    getUserBalance(vaultAddress: string, userAddress: string): Promise<string | null>;
}
