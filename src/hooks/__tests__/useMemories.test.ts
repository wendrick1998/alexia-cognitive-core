
import { renderHook, waitFor } from '../../utils/testUtils';
import { useMemories } from '../useMemories';

// Mock the useQuery hook
const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => mockUseQuery(options),
}));

describe('useMemories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemories());

    expect(result.current.loading).toBe(true);
    expect(result.current.memories).toEqual([]);
  });

  it('returns memories data when loaded', async () => {
    const mockMemories = [
      {
        id: '1',
        content: 'This is a test memory',
        type: 'fact' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
        project_id: null,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: mockMemories,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.memories).toEqual(mockMemories);
    });
  });

  it('handles error state', async () => {
    const mockError = new Error('Failed to load memories');

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.memories).toEqual([]);
    });
  });
});
