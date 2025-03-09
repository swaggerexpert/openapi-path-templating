import { assert } from 'chai';

import { percentEndingNormalizer } from '../../src/index.js';

describe('normalization', function () {
  context('percent-encoding normalization', function () {
    specify('should perform percent-encoding normalization of path template', function () {
      // test case 1: Normalize unreserved characters
      assert.strictEqual(
        percentEndingNormalizer('/api/%7Euser/%41ccount'),
        '/api/~user/Account',
        'Should decode unreserved characters',
      );

      // test case 2: Preserve reserved characters
      assert.strictEqual(
        percentEndingNormalizer('/api/%2Fusers/%3Fquery'),
        '/api/%2Fusers/%3Fquery',
        'Should preserve reserved characters without decoding',
      );

      // test case 3: Path with template expressions
      assert.strictEqual(
        percentEndingNormalizer('/api/{userId}/%7Eprofile/%41ccount'),
        '/api/{userId}/~profile/Account',
        'Should decode unreserved characters but preserve template expressions',
      );

      // test case 4: Path with invalid percent-encoding
      assert.strictEqual(
        percentEndingNormalizer('/api/%ZZ/users'),
        '/api/%ZZ/users',
        'Should return original path if invalid percent-encoding is present',
      );

      // test case 5: Path with mixed unreserved and reserved characters
      assert.strictEqual(
        percentEndingNormalizer('/api/%7Euser/%2Fprofile/%3Fid%3D1'),
        '/api/~user/%2Fprofile/%3Fid%3D1',
        'Should decode unreserved characters and preserve reserved characters',
      );

      // test case 6: Path template with no percent-encoding
      assert.strictEqual(
        percentEndingNormalizer('/api/users/profile'),
        '/api/users/profile',
        'Should return original path if no percent-encoding is present',
      );

      // test case 7: Encoded template expression
      assert.strictEqual(
        percentEndingNormalizer('/api/%7BuserId%7D/profile/%41ccount/{account}'),
        '/api/%7BuserId%7D/profile/Account/{account}',
        'Should not  decode encoded template expressions and unreserved characters',
      );
    });

    specify('should return original path template if parsing fails', function () {
      assert.strictEqual(percentEndingNormalizer('test1/test2'), 'test1/test2');
    });
  });
});
