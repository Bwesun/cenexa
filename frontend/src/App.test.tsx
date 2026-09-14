import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

test('renders without crashing', () => {
  const { baseElement } = render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  expect(baseElement).toBeDefined();
});
