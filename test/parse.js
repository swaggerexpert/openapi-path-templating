import { assert } from 'chai';

import { parse } from '../src/index.js';

describe('parse', function () {
  context('given valid source string', function () {
    context('/pets/{petId}', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/pets/{petId}');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/pets/{petId}'],
          ['slash', '/'],
          ['path-literal', 'pets'],
          ['slash', '/'],
          ['template-expression', '{petId}'],
          ['template-expression-param-name', 'petId'],
        ]);
      });
    });

    context('/{petId}', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/{petId}');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/{petId}'],
          ['slash', '/'],
          ['template-expression', '{petId}'],
          ['template-expression-param-name', 'petId'],
        ]);
      });
    });

    context('/{petId}/', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/{petId}/');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/{petId}/'],
          ['slash', '/'],
          ['template-expression', '{petId}'],
          ['template-expression-param-name', 'petId'],
          ['slash', '/'],
        ]);
      });
    });

    context('/a{petId}', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/a{petId}');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/a{petId}'],
          ['slash', '/'],
          ['path-literal', 'a'],
          ['template-expression', '{petId}'],
          ['template-expression-param-name', 'petId'],
        ]);
      });
    });

    context('/pets?offset=0&limit=10', function () {
      specify('should not parse with query', function () {
        const parseResult = parse('/pets?offset=0&limit=10');

        assert.isFalse(parseResult.result.success);
      });
    });

    context('/pets?offset{offset}limit={limit}', function () {
      specify('should not parse with template expressions in query', function () {
        const parseResult = parse('/pets?offset{offset}limit={limit}');

        assert.isFalse(parseResult.result.success);
      });
    });

    context('/pets?offset={offset}&limit={limit}', function () {
      specify('should not parse with template expressions in query', function () {
        const parseResult = parse('/pets?offset={offset}&limit={limit}');

        assert.isFalse(parseResult.result.success);
      });
    });

    context('/pets#fragment', function () {
      specify('should not parse with fragment', function () {
        const parseResult = parse('/pets#fragment');

        assert.isFalse(parseResult.result.success);
      });
    });

    context('/pets?offset=0#fragment', function () {
      specify('should not parse with query and fragment', function () {
        const parseResult = parse('/pets?offset=0#fragment');

        assert.isFalse(parseResult.result.success);
      });
    });

    context('/pets/mine', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/pets/mine');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/pets/mine'],
          ['slash', '/'],
          ['path-literal', 'pets'],
          ['slash', '/'],
          ['path-literal', 'mine'],
        ]);
      });
    });

    context('/', function () {
      specify('should parse and translate', function () {
        const parseResult = parse('/');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parts, [
          ['path-template', '/'],
          ['slash', '/'],
        ]);
      });
    });
  });

  context('given invalid source string', function () {
    context('given empty value for template expression', function () {
      specify('should fail parsing', function () {
        const parseResult = parse('/pets/{petId}/');

        assert.isTrue(parseResult.result.success);
      });
    });

    context('empty string', function () {
      specify('should fail parsing', function () {
        const parseResult = parse('');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isFalse(parseResult.result.success);
        assert.lengthOf(parts, 0);
      });
    });

    context('1', function () {
      specify('should fail parsing', function () {
        const parseResult = parse('1');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isFalse(parseResult.result.success);
        assert.lengthOf(parts, 0);
      });
    });

    context('nonsensical string', function () {
      specify('should fail parsing', function () {
        const parseResult = parse('nonsensical string');

        const parts = [];
        parseResult.ast.translate(parts);

        assert.isFalse(parseResult.result.success);
        assert.lengthOf(parts, 0);
      });
    });
  });

  context('given non-string input', function () {
    specify('should throw error', function () {
      assert.throws(() => parse(1), Error);
      assert.throws(() => parse(null), Error);
      assert.throws(() => parse(undefined), Error);
    });
  });
});
