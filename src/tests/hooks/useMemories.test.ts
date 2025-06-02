
import { renderHook, waitFor } from '../../utils/testUtils';
import { useMemories } from '../../hooks/useMemories';

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
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useMemories());

    expect(result.current.loading).toBe(true);
    expect(result.current.memories).toEqual([]);
  });

  it('should handle memory creation', async () => {
    const { result } = renderHook(() => useMemories());
    
    await waitFor(() => {
      expect(result.current.createMemory).toBeDefined();
    });
    
    expect(typeof result.current.createMemory).toBe('function');
  });

  it('should handle memory search via fetchMemories', async () => {
    const { result } = renderHook(() => useMemories());
    
    await waitFor(() => {
      expect(result.current.fetchMemories).toBeDefined();
    });
    
    expect(typeof result.current.fetchMemories).toBe('function');
  });
});
