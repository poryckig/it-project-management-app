import { validateUsername, validatePassword } from './validation';

describe('Validation Middleware', () => {
  describe('validateUsername', () => {
    it('should return true for valid usernames', () => {
      // Given
      const validUsernames = ['validUser123', 'User123', 'user'];

      validUsernames.forEach(username => {
        // When
        const result = validateUsername(username);

        // Then
        expect(result).toBe(true);
      });
    });

    it('should return false for invalid usernames', () => {
      // Given
      const invalidUsernames = [
        'us', // Too short
        'thisusernameiswaytoolongtobevalid', // Too long
        'invalid_user', // Contains invalid character
        'invalid user' // Contains space
      ];

      invalidUsernames.forEach(username => {
        // When
        const result = validateUsername(username);

        // Then
        expect(result).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid passwords', () => {
      // Given
      const validPasswords = ['Valid123!', 'AnotherValid1@'];

      validPasswords.forEach(password => {
        // When
        const result = validatePassword(password);

        // Then
        expect(result).toBe(true);
      });
    });

    it('should return false for invalid passwords', () => {
      // Given
      const invalidPasswords = [
        'short1!', // Too short
        'nouppercase1!', // No uppercase letter
        'NOLOWERCASE1!', // No lowercase letter
        'NoSpecialChar1', // No special character
        'NoNumber!' // No number
      ];

      invalidPasswords.forEach(password => {
        // When
        const result = validatePassword(password);

        // Then
        expect(result).toBe(false);
      });
    });
  });
});