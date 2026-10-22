import { assert } from 'chai';

import {
  toRegExp,
  resolve,
  encodePathComponent,
  OpenAPIPathTemplatingParseError,
} from '../src/index.js';

describe('toRegExp', function () {
  specify(
    'should create regular expression with capturing group for every template expression',
    function () {
      const regExp = toRegExp('/pets/{petId}/owners/{ownerId}');

      assert.instanceOf(regExp, RegExp);
      assert.deepEqual(regExp.exec('/pets/1/owners/2').slice(1), ['1', '2']);
      assert.isUndefined(regExp.exec('/pets/1/owners/2').groups);
    },
  );

  specify('should match template expressions within path segment', function () {
    const regExp = toRegExp('/files/{name}.{ext}');

    assert.deepEqual(regExp.exec('/files/report.tar.gz').slice(1), ['report', 'tar.gz']);
    assert.isFalse(regExp.test('/files/report'));
  });

  specify('should match adjacent template expressions', function () {
    const regExp = toRegExp('/{a}{b}');

    assert.deepEqual(regExp.exec('/xyz').slice(1), ['x', 'yz']);
    assert.isFalse(regExp.test('/x'));
  });

  specify('should not backtrack catastrophically', function () {
    const cases = [
      ['/{a}{b}{c}{d}{e}', `/${'x'.repeat(100000)}/`],
      ['/{a}.{b}.{c}.{d}', `/${'.'.repeat(100000)}/`],
      ['/{a}x{b}x{c}x{d}', `/${'xa'.repeat(50000)}/`],
      ['/{a}%2F{b}%2F{c}', `/${'%2f'.repeat(30000)}/`],
    ];

    cases.forEach(([pathTemplate, path]) => {
      const start = Date.now();

      assert.isFalse(toRegExp(pathTemplate).test(path));
      assert.isBelow(Date.now() - start, 500, pathTemplate);
    });
  });

  specify('should not match "/", "?" and "#" by template expression', function () {
    const regExp = toRegExp('/pets/{petId}');

    assert.isFalse(regExp.test('/pets/a/b'));
    assert.isFalse(regExp.test('/pets/1?offset=0'));
    assert.isFalse(regExp.test('/pets/1#fragment'));
    assert.isFalse(regExp.test('/pets/'));
  });

  specify('should match percent-encoded octets by template expression as a whole', function () {
    const regExp = toRegExp('/pets/{petId}');

    assert.deepEqual(regExp.exec('/pets/a%2Fb').slice(1), ['a%2Fb']);
    assert.isFalse(regExp.test('/pets/50%'));
    assert.isFalse(regExp.test('/pets/%2'));
  });

  specify('should escape regular expression syntax in path literals', function () {
    const regExp = toRegExp('/v1.0/$x+*=/{id}');

    assert.isTrue(regExp.test('/v1.0/$x+*=/2'));
    assert.isFalse(regExp.test('/v1x0/$x+*=/2'));
    assert.isFalse(regExp.test('/v1.0/$xx*=/2'));
  });

  specify('should match path literals case-sensitively', function () {
    const regExp = toRegExp('/Pets/%2F');

    assert.isFalse(regExp.test('/pets/%2F'));
    assert.isTrue(regExp.test('/Pets/%2f'));
  });

  specify('should distinguish trailing slash', function () {
    assert.isFalse(toRegExp('/pets').test('/pets/'));
    assert.isFalse(toRegExp('/pets/').test('/pets'));
    assert.isTrue(toRegExp('/').test('/'));
    assert.isFalse(toRegExp('/').test('/pets'));
  });

  specify('should support any template expression names', function () {
    assert.deepEqual(toRegExp('/{pet-id}/{pet id}/{$1}').exec('/a/b/c').slice(1), ['a', 'b', 'c']);
    assert.deepEqual(toRegExp('/pets/{id}/owners/{id}').exec('/pets/1/owners/2').slice(1), [
      '1',
      '2',
    ]);
    assert.lengthOf(toRegExp('/pets').exec('/pets'), 1);
  });

  specify('should match paths produced by resolve', function () {
    const regExp = toRegExp('/pets/{id}/owners');
    const values = ['1', 'a b', 'a/b', 'ä', '%', '50%', '?#', '[]', 'x%2Fy', '😀', '..', "it's"];

    values.forEach((value) => {
      const match = regExp.exec(resolve('/pets/{id}/owners', { id: value }));

      assert.isNotNull(match, value);
      assert.strictEqual(match[1], encodePathComponent(value));
    });
  });

  context('given prefix option', function () {
    specify('should match path prefix ending at segment boundary', function () {
      const regExp = toRegExp('/api/{version}', { prefix: true });

      assert.strictEqual(regExp.exec('/api/v1/pets')[0], '/api/v1');
      assert.isTrue(regExp.test('/api/v1'));
      assert.isFalse(regExp.test('/apix/v1'));
      assert.isTrue(toRegExp('/', { prefix: true }).test('/pets'));
      assert.isTrue(toRegExp('/api/', { prefix: true }).test('/api/pets'));
      assert.isFalse(
        toRegExp('/api/', { prefix: true, optionalTrailingSlash: true }).test('/apix'),
      );
    });

    specify('should match path prefix followed by query or fragment', function () {
      assert.isTrue(toRegExp('/api', { prefix: true }).test('/api?offset=0'));
      assert.isTrue(toRegExp('/api/{version}', { prefix: true }).test('/api/v1#top'));
    });

    specify('should consume optional trailing slash when present', function () {
      const options = { prefix: true, optionalTrailingSlash: true };

      assert.strictEqual(toRegExp('/pets', options).exec('/pets/toys')[0], '/pets/');
      assert.strictEqual(toRegExp('/pets/', options).exec('/pets/toys')[0], '/pets/');
      assert.strictEqual(toRegExp('/pets/', options).exec('/pets')[0], '/pets');
    });
  });

  context('given optionalTrailingSlash option', function () {
    specify('should match optional trailing slash', function () {
      assert.isTrue(toRegExp('/pets', { optionalTrailingSlash: true }).test('/pets/'));
      assert.isTrue(toRegExp('/pets', { optionalTrailingSlash: true }).test('/pets'));
      assert.isTrue(toRegExp('/pets/', { optionalTrailingSlash: true }).test('/pets'));
      assert.isFalse(toRegExp('/pets', { optionalTrailingSlash: true }).test('/pets//'));
    });
  });

  context('given caseSensitive option', function () {
    specify('should match path literals case-insensitively', function () {
      const regExp = toRegExp('/Pets/{petId}', { caseSensitive: false });

      assert.deepEqual(regExp.exec('/pets/Rex').slice(1), ['Rex']);
    });
  });

  context('given invalid path template', function () {
    specify('should throw OpenAPIPathTemplatingParseError', function () {
      ['', 'pets', '/{', '/a}', '/[x]'].forEach((pathTemplate) => {
        try {
          toRegExp(pathTemplate);
          assert.fail('should have thrown');
        } catch (error) {
          assert.instanceOf(error, OpenAPIPathTemplatingParseError);
          assert.strictEqual(error.pathTemplate, pathTemplate);
        }
      });
    });

    specify('should throw TypeError for non-string input', function () {
      assert.throws(() => toRegExp(1), TypeError);
    });
  });
});
