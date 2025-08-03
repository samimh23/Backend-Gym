import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 🔧 Configuration Module (MUST be first)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // 📊 Database Module
    PrismaModule,

    // 🔐 Authentication Module (you already have this)
    AuthModule,

    // Add these modules as you create them:
    // UserModule,
    // CoachModule,
    // ClientModule,
    // SubscriptionModule,
    // WorkoutModule,
    // NutritionModule,
    // ReviewModule,
    // PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}