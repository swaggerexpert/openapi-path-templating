import { assert } from 'chai';

import { pathSegmentNormalizer } from '../../src/index.js';

describe('normalization', function () {
  context('path segment normalization', function () {
    specify('should normalize path segments of path template', function () {
      // test case 1: Basic path with '.' segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/./users/profile'),
        '/api/users/profile',
        'Should remove single dot segments',
      );

      // test case 2: Path with '..' segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/users/../profile'),
        '/api/profile',
        'Should correctly resolve double dot segments',
      );

      // test case 3: Path with multiple '.' and '..' segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/./users/.././profile/../account'),
        '/api/account',
        'Should correctly resolve mixed dot segments',
      );

      // test case 4: Path with trailing '..' segment
      assert.strictEqual(
        pathSegmentNormalizer('/api/users/../..'),
        '/',
        'Should resolve to root for trailing double dot segments',
      );

      // test case 5: Path with template expressions and dot segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/{userId}/./profile/../account'),
        '/api/{userId}/account',
        'Should preserve template expressions and normalize dot segments',
      );

      // test case 6: Path with root-only double dot segment
      assert.strictEqual(
        pathSegmentNormalizer('/..'),
        '/',
        'Should resolve to root for root-only double dot segments',
      );

      // test case 7: Path with encoded dot segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/%2E/%2E%2E/section'),
        '/api/%2E/%2E%2E/section',
        'Should not resolve percent-encoded dot segments',
      );

      // test case 8: Path without dot segments
      assert.strictEqual(
        pathSegmentNormalizer('/api/users/profile'),
        '/api/users/profile',
        'Should return original path if no dot segments are present',
      );

      // test case 9: https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4
      assert.strictEqual(
        pathSegmentNormalizer('/a/b/c/./../../g'),
        '/a/g',
        'Should handle RFC 3986 example 1',
      );

      // test case 10:https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4
      assert.strictEqual(
        pathSegmentNormalizer('/mid/content=5/../6'),
        '/mid/6',
        'Should handle RFC 3986 example 2',
      );
    });

    specify('should return original path template if parsing fails', function () {
      assert.strictEqual(pathSegmentNormalizer('test1/test2'), 'test1/test2');
    });
  });
});
