import { assert } from 'chai';

import {
  parse,
  ListTranslator,
  OpenAPIPathTemplatingError,
  OpenAPIPathTemplatingParseError,
} from '../../src/index.js';

describe('parse', function () {
  context('errors', function () {
    specify('should throw TypeError on non-string input', function () {
      assert.throws(() => parse(1), TypeError, 'Path template must be a string');
    });

    specify('should wrap unexpected errors in OpenAPIPathTemplatingParseError', function () {
      class FailingTranslator extends ListTranslator {
        getTree() {
          throw new Error('boom');
        }
      }
      const translator = new FailingTranslator();

      try {
        parse('/pets', { translator });
        assert.fail('should have thrown');
      } catch (error) {
        assert.instanceOf(error, OpenAPIPathTemplatingParseError);
        assert.instanceOf(error, OpenAPIPathTemplatingError);
        assert.strictEqual(error.pathTemplate, '/pets');
        assert.strictEqual(error.cause.message, 'boom');
      }
    });
  });
});
