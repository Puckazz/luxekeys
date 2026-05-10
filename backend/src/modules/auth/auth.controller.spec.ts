import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { createMockUser, uuid } from '../../common/testing/index.js';

import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refresh: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    configService = {
      get: jest.fn().mockReturnValue('mocked-value'),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should delegate to service.register', async () => {
    const res = {
      accessToken: 'token',
      refreshToken: 'refresh-token',
      user: createMockUser(),
    };
    service.register.mockResolvedValue(res as never);

    const req = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' };
    const resObj = { cookie: jest.fn() };
    const result = await controller.register(
      { email: 'test@example.com' } as never,
      req as never,
      resObj as never,
    );
    expect(service.register).toHaveBeenCalled();
    const { refreshToken: _refreshToken, ...expected } = res;
    expect(result).toEqual(expected);
  });

  it('login should delegate to service.login', async () => {
    const res = {
      accessToken: 'token',
      refreshToken: 'refresh-token',
      user: createMockUser(),
    };
    service.login.mockResolvedValue(res as never);

    const req = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' };
    const resObj = { cookie: jest.fn() };
    const result = await controller.login(
      { email: 'test@example.com', password: 'password' } as never,
      req as never,
      resObj as never,
    );
    expect(service.login).toHaveBeenCalled();
    const { refreshToken: _refreshToken, ...expected } = res;
    expect(result).toEqual(expected);
  });

  it('logout should delegate to service.logout', async () => {
    service.logout.mockResolvedValue({ loggedOut: true } as never);
    const req = { cookies: { refreshToken: 'test-token' } };
    const user = { id: uuid() };
    const result = await controller.logout(
      user as never,
      req as never,
      { clearCookie: jest.fn() } as never,
    );
    expect(service.logout).toHaveBeenCalledWith('test-token');
    expect(result).toEqual({ loggedOut: true });
  });

  it('refresh should delegate to service.refresh', async () => {
    const res = {
      accessToken: 'token',
      refreshToken: 'refresh-token',
      user: createMockUser(),
    };
    service.refresh.mockResolvedValue(res as never);
    const req = {
      cookies: { refreshToken: 'refresh-token' },
      headers: { 'user-agent': 'test' },
      ip: '127.0.0.1',
    };
    const resObj = { cookie: jest.fn() };
    const result = await controller.refresh(req as never, resObj as never);
    expect(service.refresh).toHaveBeenCalledWith('refresh-token', {
      userAgent: 'test',
      ipAddress: '127.0.0.1',
    });
    const { refreshToken: _refreshToken, ...expected } = res;
    expect(result).toEqual(expected);
  });
});
