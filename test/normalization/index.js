import { assert } from 'chai';
import { normalize } from '../../src/index.js';

describe('normalization', function () {
  context('normalize', function () {
    specify('should perform complete normalization of path template', function () {
      // test case 1: Percent-encoding, case, and path segment normalization
      assert.strictEqual(
        normalize('/API/%2faPi/%7bsection%7d/./../profile'),
        '/API/%2FaPi/profile',
        'Should handle percent-encoding, case normalization, and path segments',
      );

      // test case 2: Decode unreserved characters and normalize case
      assert.strictEqual(
        normalize('/api/%7Euser/%41ccount/%2E/%2E%2E'),
        '/api/~user/',
        'Should decode unreserved characters, normalize case and path segments',
      );

      // test case 3: Preserve template expressions and normalize path
      assert.strictEqual(
        normalize('/api/{userId}/profile/../account/%41ccount'),
        '/api/{userId}/account/Account',
        'Should preserve template expressions and normalize path segments',
      );

      // test case 4: Normalize encoded template expressions
      assert.strictEqual(
        normalize('/api/%7BuserId%7D/profile/%2E/%2E%2E/account'),
        '/api/%7BuserId%7D/account',
        'Should decode encoded template expressions and normalize path segments',
      );

      // test case 5: Preserve reserved characters and normalize path
      assert.strictEqual(
        normalize('/api/users/%2Fprofile/%3Fquery=%41'),
        '/api/users/%2Fprofile/%3Fquery=A',
        'Should preserve reserved characters and normalize percent-encoded parts',
      );

      // test case 6: Path with root-only double dot segment
      assert.strictEqual(
        normalize('/..'),
        '/',
        'Should resolve to root for root-only double dot segments',
      );

      // test case 7: Path with multiple mixed segments
      assert.strictEqual(
        normalize('/api/./users/../profile/%41ccount/.././account'),
        '/api/profile/account',
        'Should resolve complex mixed segments correctly',
      );

      // test case 8: Path with no percent-encoding or dot segments
      assert.strictEqual(
        normalize('/api/users/profile'),
        '/api/users/profile',
        'Should return original path if no normalization is needed',
      );

      // test case 9: Invalid percent-encoding
      assert.strictEqual(
        normalize('/api/%ZZ/users'),
        '/api/%ZZ/users',
        'Should return original path if invalid percent-encoding is present',
      );
    });

    specify('should return original path template if parsing fails', function () {
      assert.strictEqual(
        normalize('test1/test2'),
        'test1/test2',
        'Should return original path if parsing fails',
      );
    });
  });
});
