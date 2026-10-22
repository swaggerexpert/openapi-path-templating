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

  specify('should encode names of associative array pairs as values', function () {
    assert.strictEqual(
      expandURITemplate('{?keys*}', { keys: { 'a&b': '1', 'c/d': 'x' } }),
      '?a%26b=1&c%2Fd=x',
    );
    assert.strictEqual(expandURITemplate('{;keys*}', { keys: { 'a;b': '1' } }), ';a%3Bb=1');
  });

  specify('should expand non-plain objects as strings', function () {
    assert.strictEqual(expandURITemplate('{?d}', { d: new Date(0) }).startsWith('?d='), true);
    assert.strictEqual(
      expandURITemplate('{?o*}', { o: Object.assign(Object.create(null), { a: 1 }) }),
      '?a=1',
    );
  });

  specify('should consider null variables as no variables', function () {
    assert.strictEqual(expandURITemplate('/{x}', null), '/');
  });

  specify('should throw on malformed Unicode', function () {
    assert.throws(() => expandURITemplate('{x}', { x: '\uD800' }), OpenAPIPathTemplatingError);
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
