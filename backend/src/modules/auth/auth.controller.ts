import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthUser } from './interfaces/auth-user.interface';
import type { AuthResponse } from './auth.service';

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      dto,
      this.getRefreshContext(request),
    );
    this.setRefreshCookie(response, result.refreshToken);

    return this.toResponseBody(result);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(
      dto,
      this.getRefreshContext(request),
    );
    this.setRefreshCookie(response, result.refreshToken);

    return this.toResponseBody(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token cookie' })
  async logout(
    @CurrentUser() _user: AuthUser,
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      this.getRefreshTokenCookie(request),
    );
    this.clearRefreshCookie(response);
    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using HttpOnly cookie' })
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(
      this.getRefreshTokenCookie(request),
      this.getRefreshContext(request),
    );
    this.setRefreshCookie(response, result.refreshToken);

    return this.toResponseBody(result);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send a password reset code by email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using email verification code' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: this.useSecureCookie,
      sameSite: this.useSecureCookie ? 'none' : 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/api/auth',
    });
  }

  private toResponseBody(
    result: AuthResponse,
  ): Omit<AuthResponse, 'refreshToken'> {
    return {
      user: result.user,
      accessToken: result.accessToken,
      tokenType: result.tokenType,
      expiresIn: result.expiresIn,
    };
  }

  private getRefreshTokenCookie(request: RequestWithCookies) {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const token = cookies?.[REFRESH_COOKIE_NAME];
    return typeof token === 'string' ? token : undefined;
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: this.useSecureCookie,
      sameSite: this.useSecureCookie ? 'none' : 'lax',
      path: '/api/auth',
    });
  }

  private getRefreshContext(request: Request) {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }

  private get useSecureCookie(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      return true;
    }

    return this.configService.get<string>('AUTH_COOKIE_SECURE') === 'true';
  }
}
