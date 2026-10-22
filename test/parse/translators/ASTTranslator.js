import { assert } from 'chai';

import { parse, ASTTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('ASTTranslator', function () {
      specify('should be the default translator', function () {
        const parseResult = parse('/pets/a{petId}');
        const { tree: ast } = parse('/pets/a{petId}', { translator: new ASTTranslator() });

        assert.deepEqual(parseResult.tree, ast);
      });

      specify('should translate a path template to an AST', function () {
        const parseResult = parse('/pets/a{petId}', { translator: new ASTTranslator() });

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parseResult.tree, {
          type: 'PathTemplate',
          segments: [
            { type: 'PathSegment', parts: [{ type: 'PathLiteral', value: 'pets' }] },
            {
              type: 'PathSegment',
              parts: [
                { type: 'PathLiteral', value: 'a' },
                { type: 'TemplateExpression', name: 'petId' },
              ],
            },
          ],
          trailingSlash: false,
        });
      });

      specify('should translate root path template', function () {
        const parseResult = parse('/', { translator: new ASTTranslator() });

        assert.deepEqual(parseResult.tree, {
          type: 'PathTemplate',
          segments: [],
          trailingSlash: false,
        });
      });

      specify('should detect trailing slash', function () {
        const parseResult = parse('/{a}{b}/', { translator: new ASTTranslator() });

        assert.deepEqual(parseResult.tree, {
          type: 'PathTemplate',
          segments: [
            {
              type: 'PathSegment',
              parts: [
                { type: 'TemplateExpression', name: 'a' },
                { type: 'TemplateExpression', name: 'b' },
              ],
            },
          ],
          trailingSlash: true,
        });
      });
    });
  });
});
