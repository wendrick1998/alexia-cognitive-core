
import { renderHook, waitFor } from '@/utils/testUtils';
import { useMemories } from '@/hooks/useMemories';

// Mock Supabase client
jest.mock('@/integrations/supabase/client');

describe('useMemories', () => {
  it('should fetch memories successfully', async () => {
    const { result } = renderHook(() => useMemories());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.memories).toBeDefined();
  });

  it('should handle memory creation', async () => {
    const { result } = renderHook(() => useMemories());
    
    await waitFor(() => {
      expect(result.current.createMemory).toBeDefined();
    });
    
    expect(typeof result.current.createMemory).toBe('function');
  });

  it('should handle memory search', async () => {
    const { result } = renderHook(() => useMemories());
    
    await waitFor(() => {
      expect(result.current.searchMemories).toBeDefined();
    });
    
    expect(typeof result.current.searchMemories).toBe('function');
  });
});
