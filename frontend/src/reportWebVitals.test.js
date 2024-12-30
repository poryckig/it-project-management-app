import reportWebVitals from './reportWebVitals';

jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('does not call web-vitals functions when onPerfEntry is not a function', async () => {
    // Given
    const onPerfEntry = null;

    // When
    await reportWebVitals(onPerfEntry);

    // Then
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');
    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
    expect(getFCP).not.toHaveBeenCalled();
    expect(getLCP).not.toHaveBeenCalled();
    expect(getTTFB).not.toHaveBeenCalled();
  });

  test('does not call web-vitals functions when onPerfEntry is not provided', async () => {
    // Given
    // No onPerfEntry provided

    // When
    await reportWebVitals();

    // Then
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');
    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
    expect(getFCP).not.toHaveBeenCalled();
    expect(getLCP).not.toHaveBeenCalled();
    expect(getTTFB).not.toHaveBeenCalled();
  });
});