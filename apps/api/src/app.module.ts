import { Module } from '@nestjs/common';
import { SimulationModule } from './simulation/simulation.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    SimulationModule,
    PortfolioModule,
    ProtocolsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
