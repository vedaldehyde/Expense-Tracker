import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SpendWise application', () => {
  render(<App />);
  const brandElement = screen.getAllByText(/SpendWise/i);
  expect(brandElement.length).toBeGreaterThan(0);
});
