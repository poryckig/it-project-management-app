import dotenv from 'dotenv';
import { checkConnectionToDB } from './db/db';
import app from './app';

jest.mock('dotenv');
jest.mock('./db/db');
jest.mock('./app', () => ({
  listen: jest.fn(),
}));

describe('Server Initialization', () => {
  beforeAll(() => {
    dotenv.config.mockImplementation(() => {});
  });

  it('should load environment variables', () => {
    // Given
    // No specific setup needed for this test

    // When
    require('./index');

    // Then
    expect(dotenv.config).toHaveBeenCalled();
  });

  it('should check connection to the database', () => {
    // Given
    // No specific setup needed for this test

    // When
    require('./index');

    // Then
    expect(checkConnectionToDB).toHaveBeenCalled();
  });

  it('should start the server on the specified port', () => {
    // Given
    const PORT = process.env.PORT || 5000;

    // When
    require('./index');

    // Then
    expect(app.listen).toHaveBeenCalledWith(PORT, expect.any(Function));
  });

  it('should log the server running message', () => {
    // Given
    console.log = jest.fn();
    const PORT = process.env.PORT || 5000;

    // When
    require('./index');
    const listenCallback = app.listen.mock.calls[0][1];
    listenCallback();

    // Then
    expect(console.log).toHaveBeenCalledWith(`Server is running on port ${PORT}`);
  });
});