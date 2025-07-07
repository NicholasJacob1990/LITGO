import '@testing-library/jest-native/extend-expect';

// Mock do Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useLocalSearchParams: () => ({}),
}));

// Mock do React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do TanStack Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}));

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: { access_token: 'mock-token' } } })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      execute: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Silence warnings para testes
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
