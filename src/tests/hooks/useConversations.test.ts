
import { renderHook, waitFor } from '@/utils/testUtils';
import { useConversations } from '@/hooks/useConversations';
import { createMockConversation } from '@/tests/factories/testDataFactory';

// Mock Supabase client
jest.mock('@/integrations/supabase/client');

describe('useConversations', () => {
  it('should fetch conversations successfully', async () => {
    const { result } = renderHook(() => useConversations());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.conversations).toBeDefined();
  });

  it('should handle conversation creation', async () => {
    const { result } = renderHook(() => useConversations());
    
    await waitFor(() => {
      expect(result.current.createConversation).toBeDefined();
    });
    
    expect(typeof result.current.createConversation).toBe('function');
  });

  it('should handle conversation deletion', async () => {
    const { result } = renderHook(() => useConversations());
    
    await waitFor(() => {
      expect(result.current.deleteConversation).toBeDefined();
    });
    
    expect(typeof result.current.deleteConversation).toBe('function');
  });
});
