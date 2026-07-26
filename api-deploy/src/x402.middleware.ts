// apps/api/src/x402.middleware.ts
//
// x402 Payment Middleware for YieldGuard API
// Implements OKX Agent Payments Protocol for marketplace listing.
// Returns 402 on unpaid requests, accepts PAYMENT-SIGNATURE on replay.

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as ethers from 'ethers';

const X402_PAY_TO = process.env.X402_PAY_TO || '0xe51a8f15180e373897dfa7b840b17cb5769f249f';
const XLAYER_CHAIN_ID = 196;
const USDT_TOKEN = '0x779ded0c9e1022225f8e0630b35a9b54be713736';

// Fee mapping per route — all blockchain services at 0.1 USDT
const ROUTE_FEES: Record<string, number> = {
  '/api/blockchain': 0.1,
};

function getFeeForPath(path: string): number {
  for (const [prefix, fee] of Object.entries(ROUTE_FEES)) {
    if (path.startsWith(prefix)) return fee;
  }
  return 0.001; // default fallback
}

function buildChallenge(amount: number, resource: string) {
  return Buffer.from(JSON.stringify({
    x402Version: 2,
    accepts: [{
      scheme: 'exact',
      network: `eip155:${XLAYER_CHAIN_ID}`,
      chainId: XLAYER_CHAIN_ID,
      asset: USDT_TOKEN,
      amount: String(Math.round(amount * 1e6)),
      payTo: X402_PAY_TO,
      maxTimeoutSeconds: 60,
      description: `ForgeVault: ${resource}`,
      extra: { name: 'Tether USD', version: '1' },
    }],
    resource,
  })).toString('base64');
}

@Injectable()
export class X402Middleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // DEBUG: Always return 402 to verify middleware is loaded
    return res.status(402).json({ error: 'middleware_active', path: req.path, method: req.method });

    // Check for payment proof
    const auth = (req.headers['payment-signature'] || req.headers['PAYMENT-SIGNATURE'] || 
                  req.headers['x-payment'] || req.headers['X-PAYMENT']) as string;

    if (auth) {
      try {
        const decoded = JSON.parse(Buffer.from(auth, 'base64').toString('utf8'));
        
        if (decoded.accepted) {
          const accepted = decoded.accepted;
          const expectedAmount = String(Math.round(getFeeForPath(req.path) * 1e6));
          
          // Validate the payment
          if (accepted.amount !== expectedAmount) {
            return res.status(402).json({ error: 'invalid_payment', message: `amount mismatch` });
          }
          if (String(accepted.chainId) !== String(XLAYER_CHAIN_ID)) {
            return res.status(402).json({ error: 'invalid_payment', message: `chain mismatch` });
          }
          if (accepted.payTo?.toLowerCase() !== X402_PAY_TO.toLowerCase()) {
            return res.status(402).json({ error: 'invalid_payment', message: `payTo mismatch` });
          }
          
          // Payment accepted
          (req as any).x402 = { paid: true };
          return next();
        }
        
        // Legacy format: {payload, signature}
        if (decoded.payload && decoded.signature) {
          const message = typeof decoded.payload === 'string' ? decoded.payload : JSON.stringify(decoded.payload);
          const recovered = ethers.verifyMessage(message, decoded.signature);
          if (recovered.toLowerCase() === X402_PAY_TO.toLowerCase()) {
            (req as any).x402 = { paid: true };
            return next();
          }
        }
        
        return res.status(402).json({ error: 'invalid_payment', message: 'Invalid payment header format' });
      } catch (e: any) {
        return res.status(402).json({ error: 'invalid_payment', message: e.message });
      }
    }

    // No payment — issue 402 challenge
    const fee = getFeeForPath(req.path);
    const challenge = buildChallenge(fee, req.path);
    
    res.status(402)
      .set('PAYMENT-REQUIRED', challenge)
      .set('WWW-Authenticate', `Payment x402Version="2"`)
      .json({
        error: 'payment_required',
        message: 'Payment required via OKX Agent Payments Protocol (x402).',
        amount_usdt: fee,
        pay_to: X402_PAY_TO,
        network: `eip155:${XLAYER_CHAIN_ID}`,
        chain_id: XLAYER_CHAIN_ID,
        asset: USDT_TOKEN,
      });
  }
}
