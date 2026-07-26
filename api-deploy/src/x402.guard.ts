import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import * as ethers from 'ethers';

const X402_PAY_TO = process.env.X402_PAY_TO || '0xe51a8f15180e373897dfa7b840b17cb5769f249f';
const XLAYER_CHAIN_ID = 196;
const USDT_TOKEN = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
const FEE_USDT = 0.1;

function buildChallenge(resource: string) {
  return Buffer.from(JSON.stringify({
    x402Version: 2,
    accepts: [{
      scheme: 'exact',
      network: `eip155:${XLAYER_CHAIN_ID}`,
      chainId: XLAYER_CHAIN_ID,
      asset: USDT_TOKEN,
      amount: String(Math.round(FEE_USDT * 1e6)),
      payTo: X402_PAY_TO,
      maxTimeoutSeconds: 60,
      description: `ForgeVault: ${resource}`,
      extra: { name: 'Tether USD', version: '1' },
    }],
    resource,
  })).toString('base64');
}

@Injectable()
export class X402Guard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    // Only guard blockchain routes
    if (!req.path.startsWith('/api/blockchain')) {
      return true;
    }

    const auth = (req.headers['payment-signature'] || req.headers['PAYMENT-SIGNATURE'] ||
                  req.headers['x-payment'] || req.headers['X-PAYMENT']) as string;

    if (auth) {
      try {
        const decoded = JSON.parse(Buffer.from(auth, 'base64').toString('utf8'));
        if (decoded.accepted) {
          const accepted = decoded.accepted;
          const expectedAmount = String(Math.round(FEE_USDT * 1e6));
          if (accepted.amount !== expectedAmount) throw new Error('amount mismatch');
          if (String(accepted.chainId) !== String(XLAYER_CHAIN_ID)) throw new Error('chain mismatch');
          if (accepted.payTo?.toLowerCase() !== X402_PAY_TO.toLowerCase()) throw new Error('payTo mismatch');
          (req as any).x402 = { paid: true };
          return true;
        }
        if (decoded.payload && decoded.signature) {
          const msg = typeof decoded.payload === 'string' ? decoded.payload : JSON.stringify(decoded.payload);
          const recovered = ethers.verifyMessage(msg, decoded.signature);
          if (recovered.toLowerCase() === X402_PAY_TO.toLowerCase()) {
            (req as any).x402 = { paid: true };
            return true;
          }
        }
      } catch (e: any) {
        res.status(402).json({ error: 'invalid_payment', message: e.message });
        return false;
      }
    }

    // No payment — issue challenge
    const challenge = buildChallenge(req.path);
    res.status(402)
      .set('PAYMENT-REQUIRED', challenge)
      .set('WWW-Authenticate', 'Payment x402Version="2"')
      .json({
        error: 'payment_required',
        message: 'Payment required via OKX Agent Payments Protocol (x402).',
        amount_usdt: FEE_USDT,
        pay_to: X402_PAY_TO,
        network: `eip155:${XLAYER_CHAIN_ID}`,
        chain_id: XLAYER_CHAIN_ID,
        asset: USDT_TOKEN,
      });
    return false;
  }
}
