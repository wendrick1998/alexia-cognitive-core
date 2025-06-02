
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackButton } from '../back-button';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('BackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default label', () => {
    render(<BackButton />);
    
    expect(screen.getByText('Voltar')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<BackButton label="Retornar" />);
    
    expect(screen.getByText('Retornar')).toBeInTheDocument();
  });

  it('navigates to specified path when clicked', () => {
    render(<BackButton to="/dashboard" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates back when no path specified', () => {
    render(<BackButton />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
