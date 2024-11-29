import { assert } from 'chai';

import { test } from '../src/index.js';

describe('test', function () {
  it('should detect as path template', function () {
    assert.isTrue(test('/{path}'));
    // trailing slash is allowed
    assert.isTrue(test('/{path}/'));
    assert.isTrue(test('/pets/{petId}'));
    assert.isTrue(test('/{entity}/me'));
    assert.isTrue(test('/books/{id}'));
    assert.isTrue(test('/a{test}'));
    assert.isTrue(test('/{test}a'));
    // parentheses are allowed
    assert.isTrue(test('/range({x},{y})'));
    // repeated parameter names are allowed
    assert.isTrue(test('/range({x},{y})/secondRange({x},{y})'));
    assert.isTrue(test('/{entity}/{another-entity}/me'));
    assert.isTrue(test('/pets?offset=0&limit=10'));
    assert.isTrue(test('/'));
    // special characters in literal are allowed
    assert.isTrue(test('/-/'));
    assert.isTrue(test('/~/'));
    assert.isTrue(test('/functions/t_Dist_2T'));
    assert.isTrue(test('/users/$count'));
    assert.isTrue(test('/users/delta()'));
    assert.isTrue(test('/directoryObjects/microsoft.graph.user'));
    assert.isTrue(test('/applications(appId=\'{appId}\')'));
    assert.isTrue(test('/communications/onlineMeetings/getAllRecordings(meetingOrganizerUserId=\'@meetingOrganizerUserId\')'));
    // special characters in parameter names are allowed
    assert.isTrue(test('/users/{user-id}'));
  });

  it('should not detect expression', function () {
    assert.isFalse(test('//'));
    assert.isFalse(test(''));
    assert.isFalse(test('1'));
    assert.isFalse(test('{petId}'));
    assert.isFalse(test('/pet/{petId'));
    assert.isFalse(test('/pets?offset={offset}&limit={limit}'));
    assert.isFalse(test('/pets?offset{offset}limit={limit}'));
    assert.isFalse(test(1));
    assert.isFalse(test(null));
    assert.isFalse(test(undefined));
  });

  context('given strict option', function () {
    specify('should detect as path template', function () {
      assert.isTrue(test('/{path}', { strict: true }));
      assert.isTrue(test('/pets/{petId}', { strict: true }));
      assert.isTrue(test('/{entity}/me', { strict: true }));
      assert.isTrue(test('/books/{id}', { strict: true }));
      assert.isTrue(test('/{entity}/{another-entity}/me'));
    });

    specify('should not detect expression', function () {
      assert.isFalse(test('/', { strict: true }));
      assert.isFalse(test('/pets/mine', { strict: true }));
      assert.isFalse(test('/pets?offset=0&limit=10', { strict: true }));
      assert.isFalse(test('/pets/{petId}?offset={offset}&limit={limit}', { strict: true }));
      assert.isFalse(test(''));
      assert.isFalse(test('1'));
      assert.isFalse(test('{petId}'));
      assert.isFalse(test('/pet/{petId'));
      assert.isFalse(test(1));
      assert.isFalse(test(null));
      assert.isFalse(test(undefined));
    });
  });
});
