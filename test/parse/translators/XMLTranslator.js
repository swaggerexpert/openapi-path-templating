import { assert } from 'chai';

import { parse, XMLTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('XMLTranslator', function () {
      specify('should translate a path template to XML', function () {
        const parseResult = parse('/{petId}', { translator: new XMLTranslator() });

        assert.isTrue(parseResult.result.success);
        assert.isString(parseResult.tree);
        assert.include(parseResult.tree, '<node name="path-template" index="0" length="8">');
        assert.include(parseResult.tree, '<node name="path-segment" index="1" length="7">');
        assert.include(
          parseResult.tree,
          '<node name="template-expression-param-name" index="2" length="5">',
        );
      });
    });
  });
});
