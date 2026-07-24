import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SimulationModule } from './simulation/simulation.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { X402Middleware } from './x402.middleware';

@Module({
  imports: [
    SimulationModule,
    PortfolioModule,
    ProtocolsModule,
    AnalyticsModule,
    BlockchainModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(X402Middleware)
      .forRoutes('*');
  }
}
