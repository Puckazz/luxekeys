import {
  AuthApiError,
  AuthResponse,
  AuthUserRecord,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types';
import usersData from '@/features/auth/mocks/users.json';
import { USER_ROLES, type UserRole } from '@/lib/rbac';

const MOCK_DELAY = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isUserRole = (value: string): value is UserRole => {
  return USER_ROLES.includes(value as UserRole);
};

const mockUsers: AuthUserRecord[] = usersData.users.map((user) => ({
  ...user,
  password: user.password,
  role: isUserRole(user.role) ? user.role : 'customer',
}));

const toPublicAuthUser = (user: AuthUserRecord): AuthUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await delay(MOCK_DELAY);

    const userByEmail = mockUsers.find((u) => u.email === data.email);

    if (!userByEmail) {
      throw new AuthApiError('User not found', {
        email: 'Email does not exist',
      });
    }

    if (userByEmail.password !== data.password) {
      throw new AuthApiError('Invalid password', {
        password: 'Incorrect password',
      });
    }

    const userWithoutPassword = toPublicAuthUser(userByEmail);
    return {
      success: true,
      user: userWithoutPassword,
      message: 'Login successful',
    };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await delay(MOCK_DELAY);

    if (data.password !== data.confirmpassword) {
      throw new AuthApiError('Validation failed', {
        confirmpassword: 'Passwords do not match',
      });
    }

    const existingUser = mockUsers.find((u) => u.email === data.email);
    if (existingUser) {
      throw new AuthApiError('Email already registered', {
        email: 'Email already registered',
      });
    }

    const newUser: AuthUserRecord = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'customer',
    };

    mockUsers.push(newUser);
    const userWithoutPassword = toPublicAuthUser(newUser);

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful',
    };
  },
};
