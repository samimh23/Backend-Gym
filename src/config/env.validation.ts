import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api/v1';

  @IsString()
  @IsOptional()
  SMTP_HOST: string;

  @IsNumber()
  @IsOptional()
  SMTP_PORT: number = 587;

  @IsString()
  @IsOptional()
  SMTP_USER: string;

  @IsString()
  @IsOptional()
  SMTP_PASS: string;

  @IsString()
  @IsOptional()
  FROM_EMAIL: string;

  @IsString()
  @IsOptional()
  FROM_NAME: string = 'Fitness Coaching Platform';

  @IsNumber()
  @IsOptional()
  BCRYPT_ROUNDS: number = 12;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_TTL: number = 60000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_LIMIT: number = 100;

  @IsString()
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:3001';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}