import { assert } from 'chai';

import { parse, ListTranslator, CSTTranslator } from '../../src/index.js';

describe('parse', function () {
  context('backward compatibility', function () {
    context('given default translator', function () {
      specify('should expose deprecated ast as ListTranslator', function () {
        const parseResult = parse('/pets/{petId}');

        assert.instanceOf(parseResult.ast, ListTranslator);
      });

      specify('should translate ast to the same list of entries as ListTranslator', function () {
        const parseResult = parse('/pets/a{petId}/');
        const { tree: list } = parse('/pets/a{petId}/', { translator: new ListTranslator() });
        const parts = [];

        parseResult.ast.translate(parts);

        assert.deepEqual(parts, list);
      });

      specify('should translate ast to XML without path-segment nodes', function () {
        const parseResult = parse('/pets/{petId}');
        const xml = parseResult.ast.toXml();

        assert.include(xml, '<node name="template-expression-param-name" index="7" length="5">');
        assert.notInclude(xml, 'path-segment');
      });

      specify('should translate ast to empty list for invalid path template', function () {
        const parseResult = parse('pets');
        const parts = [];

        parseResult.ast.translate(parts);

        assert.isFalse(parseResult.result.success);
        assert.lengthOf(parts, 0);
      });

      specify('should compute ast lazily only once', function () {
        const parseResult = parse('/pets/{petId}');

        assert.strictEqual(parseResult.ast, parseResult.ast);
      });
    });

    context('given explicit translator', function () {
      specify('should expose deprecated ast as ListTranslator', function () {
        const parseResult = parse('/pets/{petId}', { translator: new CSTTranslator() });

        assert.instanceOf(parseResult.ast, ListTranslator);
      });
    });

    context('given no translator', function () {
      specify('should expose deprecated ast as ListTranslator', function () {
        const parseResult = parse('/pets/{petId}', { translator: null });

        assert.instanceOf(parseResult.ast, ListTranslator);
      });
    });
  });
});
