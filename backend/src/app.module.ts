import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './nest_modules/auth/auth.module';
import { SupportTicketsModule } from './nest_modules/support-tickets/support-tickets.module';
import { DatabaseModule } from './shared/database/database.module';
import { CommunicationsModule } from './nest_modules/communications/communications.module';
import { CalendarEventsModule } from './nest_modules/calendar-events/calendar-events.module';
import { StorageModule } from './nest_modules/storage/storage.module';
import { PortalBannersModule } from './nest_modules/portal-banners/portal-banners.module';
import { ProfileModule } from './nest_modules/profile/profile.module';
import { DashboardModule } from './nest_modules/dashboard/dashboard.module';
import { TeamsModule } from './nest_modules/teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    SupportTicketsModule,
    CommunicationsModule,
    CalendarEventsModule,
    StorageModule,
    PortalBannersModule,
    ProfileModule,
    DashboardModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
