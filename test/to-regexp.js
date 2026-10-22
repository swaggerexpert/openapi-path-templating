import { assert } from 'chai';

import {
  toRegExp,
  resolve,
  encodePathComponent,
  OpenAPIPathTemplatingParseError,
} from '../src/index.js';

describe('toRegExp', function () {
  specify('should create regular expression and list of parameters', function () {
    const { regExp, parameters } = toRegExp('/pets/{petId}/owners/{ownerId}');

    assert.instanceOf(regExp, RegExp);
    assert.deepEqual(parameters, ['petId', 'ownerId']);
    assert.deepEqual(regExp.exec('/pets/1/owners/2').slice(1), ['1', '2']);
  });

  specify('should match template expressions within path segment', function () {
    const { regExp } = toRegExp('/files/{name}.{ext}');

    assert.deepEqual(regExp.exec('/files/report.tar.gz').slice(1), ['report.tar', 'gz']);
    assert.isFalse(regExp.test('/files/report'));
  });

  specify('should not match "/", "?" and "#" by template expression', function () {
    const { regExp } = toRegExp('/pets/{petId}');

    assert.isFalse(regExp.test('/pets/a/b'));
    assert.isFalse(regExp.test('/pets/1?offset=0'));
    assert.isFalse(regExp.test('/pets/1#fragment'));
    assert.isFalse(regExp.test('/pets/'));
  });

  specify('should match percent-encoded octets by template expression as a whole', function () {
    const { regExp } = toRegExp('/pets/{petId}');

    assert.deepEqual(regExp.exec('/pets/a%2Fb').slice(1), ['a%2Fb']);
    assert.isFalse(regExp.test('/pets/50%'));
    assert.isFalse(regExp.test('/pets/%2'));
  });

  specify('should escape regular expression syntax in path literals', function () {
    const { regExp } = toRegExp('/v1.0/$x+*=/{id}');

    assert.isTrue(regExp.test('/v1.0/$x+*=/2'));
    assert.isFalse(regExp.test('/v1x0/$x+*=/2'));
    assert.isFalse(regExp.test('/v1.0/$xx*=/2'));
  });

  specify('should match path literals case-sensitively', function () {
    const { regExp } = toRegExp('/Pets/%2F');

    assert.isFalse(regExp.test('/pets/%2F'));
    assert.isTrue(regExp.test('/Pets/%2f'));
  });

  specify('should distinguish trailing slash', function () {
    assert.isFalse(toRegExp('/pets').regExp.test('/pets/'));
    assert.isFalse(toRegExp('/pets/').regExp.test('/pets'));
    assert.isTrue(toRegExp('/').regExp.test('/'));
    assert.isFalse(toRegExp('/').regExp.test('/pets'));
  });

  specify('should list parameters in order of appearance', function () {
    assert.deepEqual(toRegExp('/pets').parameters, []);
    assert.deepEqual(toRegExp('/pets/{id}/owners/{id}').parameters, ['id', 'id']);
    assert.deepEqual(toRegExp('/{pet id}/{$1}').parameters, ['pet id', '$1']);
  });

  specify('should match paths produced by resolve', function () {
    const { regExp } = toRegExp('/pets/{id}/owners');
    const values = ['1', 'a b', 'a/b', 'ä', '%', '50%', '?#', '[]', 'x%2Fy', '😀', '..', "it's"];

    values.forEach((value) => {
      const match = regExp.exec(resolve('/pets/{id}/owners', { id: value }));

      assert.isNotNull(match, value);
      assert.strictEqual(match[1], encodePathComponent(value));
    });
  });

  context('given end option', function () {
    specify('should match path prefix ending at segment boundary', function () {
      const { regExp } = toRegExp('/api/{version}', { end: false });

      assert.strictEqual(regExp.exec('/api/v1/pets')[0], '/api/v1');
      assert.isTrue(regExp.test('/api/v1'));
      assert.isFalse(regExp.test('/apix/v1'));
      assert.isTrue(toRegExp('/', { end: false }).regExp.test('/pets'));
      assert.isTrue(toRegExp('/api/', { end: false }).regExp.test('/api/pets'));
      assert.isFalse(toRegExp('/api/', { end: false, trailing: true }).regExp.test('/apix'));
    });
  });

  context('given trailing option', function () {
    specify('should match optional trailing slash', function () {
      assert.isTrue(toRegExp('/pets', { trailing: true }).regExp.test('/pets/'));
      assert.isTrue(toRegExp('/pets', { trailing: true }).regExp.test('/pets'));
      assert.isTrue(toRegExp('/pets/', { trailing: true }).regExp.test('/pets'));
      assert.isFalse(toRegExp('/pets', { trailing: true }).regExp.test('/pets//'));
    });
  });

  context('given sensitive option', function () {
    specify('should match path literals case-insensitively', function () {
      const { regExp } = toRegExp('/Pets/{petId}', { sensitive: false });

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
