import { assert } from 'chai';

import { parseURITemplate, OpenAPIPathTemplatingParseError } from '../../src/index.js';

describe('parseURITemplate', function () {
  specify('should parse URI Template into AST', function () {
    const { result, tree } = parseURITemplate('/pets{/petId}{?fields:3,list*}');

    assert.isTrue(result.success);
    assert.deepEqual(tree, {
      type: 'URITemplate',
      parts: [
        { type: 'Literal', value: '/pets' },
        {
          type: 'Expression',
          operator: '/',
          variables: [{ name: 'petId', prefix: undefined, explode: false }],
        },
        {
          type: 'Expression',
          operator: '?',
          variables: [
            { name: 'fields', prefix: 3, explode: false },
            { name: 'list', prefix: undefined, explode: true },
          ],
        },
      ],
    });
  });

  specify('should not produce tree for invalid URI Template', function () {
    const { result, tree } = parseURITemplate('{/id*');

    assert.isFalse(result.success);
    assert.isUndefined(tree);
  });

  specify('should throw TypeError on non-string input', function () {
    assert.throws(() => parseURITemplate(1), TypeError);
  });

  specify('should export parse error', function () {
    assert.isFunction(OpenAPIPathTemplatingParseError);
  });
});
