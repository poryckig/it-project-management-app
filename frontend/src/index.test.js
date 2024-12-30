import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import reportWebVitals from './reportWebVitals';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn().mockReturnValue({
    render: jest.fn(),
  }),
}));

jest.mock('./reportWebVitals', () => jest.fn());

jest.mock('./i18n', () => ({
  init: jest.fn(),
  use: jest.fn().mockReturnThis(),
  changeLanguage: jest.fn(),
}));

describe('index.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('renders without crashing', () => {
    // Given
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    // When
    require('./index');

    // Then
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(root);
    expect(ReactDOM.createRoot(root).render).toHaveBeenCalledWith(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });

  test('calls reportWebVitals', () => {
    // Given
    require('./index');

    // When
    // No specific action needed as we are testing the initial configuration

    // Then
    expect(reportWebVitals).toHaveBeenCalled();
  });
});