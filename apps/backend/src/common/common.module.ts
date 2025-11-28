import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: "1h",
            issuer: "chatbotdysa-enterprise",
            audience: "chatbotdysa-clients"
          },
        };
      },
    }),
  ],
  providers: [AuthGuard, EmailService],
  exports: [AuthGuard, JwtModule, EmailService],
})
export class CommonModule {}