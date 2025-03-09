import { assert } from 'chai';

import { identityNormalizer } from '../../src/index.js';

describe('normalization', function () {
  context('identity normalization', function () {
    specify('should avoid path template normalization', function () {
      assert.strictEqual(identityNormalizer('/a/b/c'), '/a/b/c');
      assert.strictEqual(
        identityNormalizer('/API/%2faPi/%7bsection%7d/./../profile'),
        '/API/%2faPi/%7bsection%7d/./../profile',
      );
    });

    specify('should return original path template if parsing fails', function () {
      assert.strictEqual(identityNormalizer('test1/test2'), 'test1/test2');
    });
  });
});
