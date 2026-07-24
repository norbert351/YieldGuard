import { BlockchainService } from '../blockchain/blockchain.service';
export declare class ProtocolsService {
    private readonly blockchain;
    constructor(blockchain: BlockchainService);
    getAll(): Promise<({
        id: any;
        name: any;
        address: string;
        supportedAssets: number;
    } | null)[]>;
    getRates(): Promise<({
        asset: any;
        protocol: any;
        apy: number;
    } | null)[]>;
}
