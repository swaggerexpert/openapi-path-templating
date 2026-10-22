import { assert } from 'chai';

import { isAmbiguous, identityNormalizer } from '../../src/index.js';

describe('matching', function () {
  context('isAmbiguous', function () {
    specify('should consider path templates ambiguous', function () {
      assert.isTrue(isAmbiguous('/{entity}/me', '/books/{id}'));
      assert.isTrue(isAmbiguous('/books/{id}', '/{entity}/me'));
      assert.isTrue(isAmbiguous('/x/{a}/z', '/{b}/y/{c}'));
      assert.isTrue(isAmbiguous('/{entity}/me/', '/books/{id}/'));
    });

    specify('should not consider path templates with more concrete one ambiguous', function () {
      assert.isFalse(isAmbiguous('/pets/{petId}', '/pets/mine'));
      assert.isFalse(isAmbiguous('/pets/mine', '/pets/{petId}'));
      assert.isFalse(isAmbiguous('/shops/{shopId}/pets/{petId}', '/shops/{shopId}/pets/_search'));
      assert.isFalse(isAmbiguous('/{a}/{b}', '/{c}/x'));
    });

    specify('should not consider identical path templates ambiguous', function () {
      assert.isFalse(isAmbiguous('/pets/{petId}', '/pets/{name}'));
      assert.isFalse(isAmbiguous('/pets/mine', '/pets/mine'));
    });

    specify('should not consider non-overlapping path templates ambiguous', function () {
      assert.isFalse(isAmbiguous('/a/{x}', '/b/{y}'));
      assert.isFalse(isAmbiguous('/pets/{id}', '/pets/{id}/owners'));
      assert.isFalse(isAmbiguous('/pets/{id}/', '/pets/{id}'));
      assert.isFalse(isAmbiguous('/', '/{id}'));
    });

    specify('should handle template expressions mixed with literals', function () {
      assert.isTrue(isAmbiguous('/files/{name}.json', '/files/report.{ext}'));
      assert.isTrue(isAmbiguous('/a{x}', '/{y}b'));
      assert.isFalse(isAmbiguous('/files/{name}.json', '/files/{name}'));
      assert.isFalse(isAmbiguous('/files/{name}.json', '/files/{name}.xml'));
      assert.isFalse(isAmbiguous('/{a}', '/{b}{c}'));
    });

    specify('should treat percent-encoded octets as single characters', function () {
      assert.isFalse(isAmbiguous('/%2F{x}F', '/{y}%2F'));
      assert.isFalse(isAmbiguous('/%2f{x}F', '/{y}%2F', { normalizer: identityNormalizer }));
      assert.isTrue(isAmbiguous('/%2F{x}', '/{y}%2F'));
      assert.isTrue(isAmbiguous('/%2f{x}', '/{y}%2F', { normalizer: identityNormalizer }));
    });

    specify('should return false on invalid path templates', function () {
      assert.isFalse(isAmbiguous('/a', 'b'));
      assert.isFalse(isAmbiguous('a', '/b'));
      assert.isFalse(isAmbiguous('', '/'));
      assert.isFalse(isAmbiguous(1, '/{a}'));
      assert.isFalse(isAmbiguous('/{a}', null));
    });

    specify('should normalize before establishing ambiguity', function () {
      assert.isTrue(isAmbiguous('/{entity}/me', '/books/./{id}'));
      assert.isTrue(isAmbiguous('/{entity}/%6De', '/books/{id}'));
      assert.isFalse(
        isAmbiguous('/{entity}/me', '/books/./{id}', { normalizer: identityNormalizer }),
      );
    });
  });
});
