import { assert } from 'chai';

import {
  expandURITemplate,
  OpenAPIPathTemplatingError,
  OpenAPIPathTemplatingParseError,
} from '../../src/index.js';

describe('expandURITemplate', function () {
  specify('should expand URI Template', function () {
    assert.strictEqual(expandURITemplate('/pets/{petId}', { petId: 'a b' }), '/pets/a%20b');
    assert.strictEqual(expandURITemplate('/pets{?ids*}', { ids: [1, 2] }), '/pets?ids=1&ids=2');
  });

  specify('should ignore undefined and inherited variables', function () {
    assert.strictEqual(expandURITemplate('/pets/{petId}'), '/pets/');
    assert.strictEqual(expandURITemplate('{constructor}', {}), '');
    assert.strictEqual(expandURITemplate('{?a,b}', { a: null, b: [] }), '');
  });

  specify('should throw on invalid URI Template', function () {
    assert.throws(() => expandURITemplate('{/id*', {}), OpenAPIPathTemplatingParseError);
  });

  specify('should throw on reserved operator', function () {
    assert.throws(() => expandURITemplate('{!hello}', {}), OpenAPIPathTemplatingParseError);
  });

  specify('should throw on prefix modifier of composite value', function () {
    assert.throws(() => expandURITemplate('{list:1}', { list: ['a'] }), OpenAPIPathTemplatingError);
  });
});
