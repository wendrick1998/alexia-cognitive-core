
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackButton from '../back-button';

describe('BackButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Voltar');
  });

  it('calls onClick when clicked', () => {
    render(<BackButton onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<BackButton onClick={mockOnClick} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('can hide text', () => {
    render(<BackButton onClick={mockOnClick} showText={false} />);
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveTextContent('Voltar');
  });

  it('accepts custom text', () => {
    render(<BackButton onClick={mockOnClick} text="Retornar" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Retornar');
  });
});
