import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { EmailService } from './services/email.service';
import { RealtimeNotificationService } from './services/realtime-notification.service';
import { WebSocketsModule } from '../modules/websockets/websockets.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '1h',
            issuer: 'chatbotdysa-enterprise',
            audience: 'chatbotdysa-clients',
          },
        };
      },
    }),
    forwardRef(() => WebSocketsModule),
  ],
  providers: [AuthGuard, EmailService, RealtimeNotificationService],
  exports: [AuthGuard, JwtModule, EmailService, RealtimeNotificationService],
})
export class CommonModule {}
