import { ProtocolsService } from './protocols.service';
export declare class ProtocolsController {
    private readonly protocolsService;
    constructor(protocolsService: ProtocolsService);
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
}
