import { assert } from 'chai';

import { isIdentical, identityNormalizer } from '../../src/index.js';

describe('equivalence', function () {
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

    specify('should normalize before establishing equivalence', function () {
      assert.isTrue(isIdentical('/api/./users/../profile', '/api/profile'));
      assert.isTrue(isIdentical('/api/%7Euser/%41ccount/%2E/%2E%2E', '/api/~user/'));
      assert.isTrue(isIdentical('/API/%2faPi/%7bsection%7d/./../profile', '/API/%2FaPi/profile'));
      assert.isTrue(
        isIdentical('/api/{userId}/profile/../account/%41ccount', '/api/{userId}/account/Account'),
      );
      assert.isTrue(
        isIdentical('/api/%7BuserId%7D/profile/%2E/%2E%2E/account', '/api/%7BuserId%7D/account'),
      );
      assert.isTrue(
        isIdentical('/api/users/%2Fprofile/%3Fquery=%41', '/api/users/%2Fprofile/%3Fquery=A'),
      );
      assert.isTrue(isIdentical('/..', '/'));
      assert.isTrue(
        isIdentical('/api/./users/../profile/%41ccount/.././account', '/api/profile/account'),
      );
      assert.isTrue(isIdentical('/api/users/profile', '/api/users/profile'));
      assert.isTrue(isIdentical('/api/%ZZ/users', '/api/%ZZ/users'));
      assert.isTrue(isIdentical('/pets/%2E/%2E%2E/{petId}', '/{petId}'));
    });

    context('given normalizer option', function () {
      const normalizer = identityNormalizer;

      specify('should perform custom normalization before establishing equivalence', function () {
        assert.isFalse(isIdentical('/api/./users/../profile', '/api/profile', { normalizer }));
        assert.isFalse(
          isIdentical('/api/%7Euser/%41ccount/%2E/%2E%2E', '/api/~user/', { normalizer }),
        );
        assert.isFalse(
          isIdentical('/API/%2faPi/%7bsection%7d/./../profile', '/API/%2FaPi/profile', {
            normalizer,
          }),
        );
        assert.isFalse(
          isIdentical(
            '/api/{userId}/profile/../account/%41ccount',
            '/api/{userId}/account/Account',
            { normalizer },
          ),
        );
        assert.isFalse(
          isIdentical('/api/%7BuserId%7D/profile/%2E/%2E%2E/account', '/api/%7BuserId%7D/account', {
            normalizer,
          }),
        );
        assert.isFalse(
          isIdentical('/api/users/%2Fprofile/%3Fquery=%41', '/api/users/%2Fprofile/%3Fquery=A', {
            normalizer,
          }),
        );
        assert.isFalse(isIdentical('/..', '/', { normalizer }));
        assert.isFalse(
          isIdentical('/api/./users/../profile/%41ccount/.././account', '/api/profile/account', {
            normalizer,
          }),
        );
        assert.isTrue(isIdentical('/api/users/profile', '/api/users/profile', { normalizer }));
        assert.isTrue(isIdentical('/api/%ZZ/users', '/api/%ZZ/users', { normalizer }));
        assert.isFalse(isIdentical('/pets/%2E/%2E%2E/{petId}', '/{petId}', { normalizer }));
      });
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
