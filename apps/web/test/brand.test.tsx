/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { Logo } from '../src/components/brand/Logo';

describe('Swap Brand Components', () => {
  it('renders SWAP logo brand text and interlocking arrows SVG', () => {
    render(<Logo size="md" showText={true} />);

    expect(screen.getByText('SWAP')).toBeInTheDocument();
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('renders minimal icon without text when showText is false', () => {
    render(<Logo size="sm" showText={false} />);

    expect(screen.queryByText('SWAP')).toBeNull();
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
