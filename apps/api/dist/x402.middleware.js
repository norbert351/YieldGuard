"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402Middleware = void 0;
const common_1 = require("@nestjs/common");
const ethers = require("ethers");
const SELLER_PK = process.env.FOUNDRY_WALLET_PK || process.env.YIELDGUARD_WALLET_PK || '';
const SELLER_ADDRESS = SELLER_PK ? new ethers.Wallet(SELLER_PK).address : null;
const XLAYER_CHAIN_ID = 196;
const USDT_TOKEN = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
const ROUTE_FEES = {
    '/api/simulation': 0.001,
    '/api/portfolio': 0.001,
    '/api/protocols': 0.001,
    '/api/analytics': 0.001,
    '/api/blockchain': 0.001,
};
function getFeeForPath(path) {
    for (const [prefix, fee] of Object.entries(ROUTE_FEES)) {
        if (path.startsWith(prefix))
            return fee;
    }
    return 0.001;
}
function buildChallenge(amount, resource) {
    return Buffer.from(JSON.stringify({
        x402Version: 2,
        accepts: [{
                scheme: 'exact',
                network: `eip155:${XLAYER_CHAIN_ID}`,
                chainId: XLAYER_CHAIN_ID,
                asset: USDT_TOKEN,
                amount: String(Math.round(amount * 1e6)),
                payTo: SELLER_ADDRESS,
                maxTimeoutSeconds: 60,
                description: `ForgeVault: ${resource}`,
                extra: { name: 'Tether USD', version: '1' },
            }],
        resource,
    })).toString('base64');
}
let X402Middleware = class X402Middleware {
    use(req, res, next) {
        if (req.method === 'GET' && !req.headers['payment-signature'] && !req.headers['x-payment']) {
            return next();
        }
        const auth = (req.headers['payment-signature'] || req.headers['PAYMENT-SIGNATURE'] ||
            req.headers['x-payment'] || req.headers['X-PAYMENT']);
        if (auth) {
            try {
                const decoded = JSON.parse(Buffer.from(auth, 'base64').toString('utf8'));
                if (decoded.accepted) {
                    const accepted = decoded.accepted;
                    const expectedAmount = String(Math.round(getFeeForPath(req.path) * 1e6));
                    if (accepted.amount !== expectedAmount) {
                        return res.status(402).json({ error: 'invalid_payment', message: `amount mismatch` });
                    }
                    if (String(accepted.chainId) !== String(XLAYER_CHAIN_ID)) {
                        return res.status(402).json({ error: 'invalid_payment', message: `chain mismatch` });
                    }
                    if (accepted.payTo?.toLowerCase() !== SELLER_ADDRESS?.toLowerCase()) {
                        return res.status(402).json({ error: 'invalid_payment', message: `payTo mismatch` });
                    }
                    req.x402 = { paid: true };
                    return next();
                }
                if (decoded.payload && decoded.signature) {
                    const message = typeof decoded.payload === 'string' ? decoded.payload : JSON.stringify(decoded.payload);
                    const recovered = ethers.verifyMessage(message, decoded.signature);
                    if (recovered.toLowerCase() === SELLER_ADDRESS?.toLowerCase()) {
                        req.x402 = { paid: true };
                        return next();
                    }
                }
                return res.status(402).json({ error: 'invalid_payment', message: 'Invalid payment header format' });
            }
            catch (e) {
                return res.status(402).json({ error: 'invalid_payment', message: e.message });
            }
        }
        const fee = getFeeForPath(req.path);
        const challenge = buildChallenge(fee, req.path);
        res.status(402)
            .set('PAYMENT-REQUIRED', challenge)
            .set('WWW-Authenticate', `Payment x402Version="2"`)
            .json({
            error: 'payment_required',
            message: 'Payment required via OKX Agent Payments Protocol (x402).',
            amount_usdt: fee,
            pay_to: SELLER_ADDRESS,
            network: `eip155:${XLAYER_CHAIN_ID}`,
            chain_id: XLAYER_CHAIN_ID,
            asset: USDT_TOKEN,
        });
    }
};
exports.X402Middleware = X402Middleware;
exports.X402Middleware = X402Middleware = __decorate([
    (0, common_1.Injectable)()
], X402Middleware);
//# sourceMappingURL=x402.middleware.js.map