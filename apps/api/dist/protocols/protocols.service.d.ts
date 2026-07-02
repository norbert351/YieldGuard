export declare class ProtocolsService {
    private protocols;
    private rates;
    getAll(): {
        id: string;
        name: string;
        color: string;
        tvl: string;
        supportedAssets: number;
    }[];
    getRates(): {
        best: string;
        asset: string;
        aave: number;
        morpho: number;
        compound: number;
    }[];
    private findBest;
}
