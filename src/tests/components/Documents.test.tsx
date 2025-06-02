
import React from 'react';
import { render, screen } from '@/utils/testUtils';
import DocumentsManager from '@/components/DocumentsManager';
import { useDocuments } from '@/hooks/useDocuments';

// Mock hook
jest.mock('@/hooks/useDocuments');

const mockUseDocuments = useDocuments as jest.MockedFunction<typeof useDocuments>;

describe('DocumentsManager', () => {
  beforeEach(() => {
    mockUseDocuments.mockReturnValue({
      documents: [],
      isLoading: false,
      uploadDocument: jest.fn(),
      deleteDocument: jest.fn(),
      searchDocuments: jest.fn()
    });
  });

  it('should render documents interface', () => {
    render(<DocumentsManager />);
    
    expect(screen.getByText(/documentos/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseDocuments.mockReturnValue({
      documents: [],
      isLoading: true,
      uploadDocument: jest.fn(),
      deleteDocument: jest.fn(),
      searchDocuments: jest.fn()
    });

    render(<DocumentsManager />);
    
    expect(screen.getByTestId('documents-loading')).toBeInTheDocument();
  });
});
