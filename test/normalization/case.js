import { assert } from 'chai';

import { caseNormalizer } from '../../src/index.js';

describe('normalization', function () {
  context('case normalization', function () {
    specify('should normalize case of path template', function () {
      // test case 1: Basic path with percent-encoded characters
      assert.strictEqual(
        caseNormalizer('/api/%2fusers/%2a'),
        '/api/%2Fusers/%2A',
        'Should convert percent-encoded hex digits to uppercase and decode unreserved characters',
      );

      // test case 2: Path template with percent-encoded characters
      assert.strictEqual(
        caseNormalizer('/api/{userId}/profile/%7bsection%7d'),
        '/api/{userId}/profile/%7Bsection%7D',
        'Should preserve path templates and uppercase percent-encoded hex digits',
      );

      // test case 3: Path with unreserved characters only
      assert.strictEqual(
        caseNormalizer('/api/users/profile'),
        '/api/users/profile',
        'Should not change unreserved characters',
      );

      // test case 4: Path template without percent-encoded characters
      assert.strictEqual(
        caseNormalizer('/api/{userId}/profile'),
        '/api/{userId}/profile',
        'Should not alter path templates without percent-encoded characters',
      );

      // Test case 5: Complex path with mixed cases and percent-encoded characters
      assert.strictEqual(
        caseNormalizer('/API/%2faPi/%7bsection%7d'),
        '/API/%2FaPi/%7Bsection%7D',
        'Should preserve case in path and normalize percent-encoded characters',
      );

      // Test case 6: Path with reserved characters that are not percent-encoded
      assert.strictEqual(
        caseNormalizer('/api/users?filter=value'),
        '/api/users?filter=value',
        'Should not alter reserved characters that are not percent-encoded',
      );
    });

    specify('should return original path template if parsing fails', function () {
      assert.strictEqual(caseNormalizer('test1/test2'), 'test1/test2');
    });
  });
});
