import { assert } from 'chai';

import { parse, Trace } from '../../src/index.js';

describe('parse', function () {
  context('trace', function () {
    specify('should not produce trace by default', function () {
      const parseResult = parse('/pets');

      assert.isUndefined(parseResult.trace);
    });

    specify('should produce trace when requested', function () {
      const parseResult = parse('/pets', { trace: true });

      assert.instanceOf(parseResult.trace, Trace);
      assert.isString(parseResult.trace.displayTrace());
    });

    specify('should infer expectations for missing leading slash', function () {
      const { result, trace } = parse('pets', { trace: true });

      assert.isFalse(result.success);
      assert.strictEqual(trace.inferExpectations().toString(), '"/"');
    });

    specify('should infer expectations for unterminated template expression', function () {
      const { result, trace } = parse('/pets/{petId', { trace: true });

      assert.isFalse(result.success);
      assert.include(trace.inferExpectations(), '}');
    });
  });
});
