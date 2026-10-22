import { assert } from 'chai';

import { parse, ListTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('ListTranslator', function () {
      specify('should translate a path template to a list of entries', function () {
        const parseResult = parse('/pets/{petId}', { translator: new ListTranslator() });

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parseResult.tree, [
          ['path-template', '/pets/{petId}'],
          ['slash', '/'],
          ['path-literal', 'pets'],
          ['slash', '/'],
          ['template-expression', '{petId}'],
          ['template-expression-param-name', 'petId'],
        ]);
      });

      specify('should not produce tree for invalid path template', function () {
        const parseResult = parse('pets', { translator: new ListTranslator() });

        assert.isFalse(parseResult.result.success);
        assert.isUndefined(parseResult.tree);
      });
    });
  });
});
