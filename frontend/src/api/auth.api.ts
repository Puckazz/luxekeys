import {
  AuthApiError,
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@/features/auth/types';
import usersData from '@/features/auth/mocks/users.json';

const MOCK_DELAY = 1000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUsers: AuthUser[] = usersData.users.map((user) => ({
  ...user,
  password: user.password,
}));

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

    const userWithoutPassword = {
      id: userByEmail.id,
      name: userByEmail.name,
      email: userByEmail.email,
    } as AuthUser;
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

    const newUser: AuthUser = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      password: data.password,
    };

    mockUsers.push(newUser);
    const userWithoutPassword = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    } as AuthUser;

    return {
      success: true,
      user: userWithoutPassword as AuthUser,
      message: 'Registration successful',
    };
  },
};
