import { assert } from 'chai';

import { isIdentical } from '../src/predicates.js';

describe('predicates', function () {
  context('isIdentical', function () {
    specify('should consider path templates identical', function () {
      assert.isTrue(isIdentical('/pets/{petId}', '/pets/{name}'));
      assert.isTrue(isIdentical('/pets/{petId}/owners/{ownerId}', '/pets/{id}/owners/{id}'));
      assert.isTrue(isIdentical('/pets/static/segment', '/pets/static/segment'));
      assert.isTrue(isIdentical('/{entity}/{id}', '/{resource}/{key}'));
      assert.isTrue(isIdentical('/pets/{petId}/', '/pets/{name}/'));
    });

    specify('should not consider path templates identical', function () {
      assert.isFalse(isIdentical('/', '/{petId}'));
      assert.isFalse(isIdentical('/pets/{petId}', '/animals/{name}'));
      assert.isFalse(isIdentical('/pets/{petId}', '/pets/{petId}/owners/{ownerId}'));
      assert.isFalse(isIdentical('/pets/static/segment', '/pets/different/segment'));
      assert.isFalse(isIdentical('/pets/{petId}/', '/pets/{petId}'));
      assert.isFalse(isIdentical('/pets/{petId}/owners/{id}', '/pets/{petId}/owners/static'));
    });

    specify('should return false on invalid path templates', function () {
      assert.isFalse(isIdentical('/a', 'b'));
      assert.isFalse(isIdentical('a', '/b'));
      assert.isFalse(isIdentical('a', 'b'));
      assert.isFalse(isIdentical('', '/'));
    });

    specify('should handle complex cases correctly', function () {
      assert.isTrue(isIdentical('/pets/{petId}/owners/{ownerId}', '/pets/{id}/owners/{id}'));
      assert.isTrue(isIdentical('/{entity}/{id}/{action}', '/{resource}/{key}/{operation}'));
      assert.isFalse(isIdentical('/pets/{petId}/owners/{ownerId}', '/pets/{id}/{ownerId}'));
      assert.isFalse(isIdentical('/pets/{petId}/{ownerId}', '/pets/{id}/{id}/actions'));
      assert.isFalse(isIdentical('/pets/{petId}/{ownerId}', '/pets/{petId}/{ownerId}/actions'));
    });

    specify('should handle non-string inputs gracefully', function () {
      assert.isFalse(isIdentical(123, 456));
      assert.isFalse(isIdentical({}, {}));
      assert.isFalse(isIdentical([], []));
      assert.isFalse(isIdentical(1, 2));
      assert.isFalse(isIdentical(null, '/b'));
      assert.isFalse(isIdentical(undefined, undefined));
    });
  });
});
