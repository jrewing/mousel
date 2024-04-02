import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('Game page', () => {
  render(<App />);
  const linkElement = screen.getByText(/mousel/i);
  expect(linkElement).toBeInTheDocument();
});
