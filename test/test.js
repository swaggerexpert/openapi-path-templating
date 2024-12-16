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
    // NOTE: the following scenario should probably be considered invalid, query parameters are not allowed in path templates
    assert.isTrue(test('/pets?offset=0&limit=10'));
    // -->
    assert.isTrue(test('/'));
    // special characters in literal are allowed
    assert.isTrue(test('/-/'));
    assert.isTrue(test('/~/'));
    // NOTE: the following scenario should probably be considered invalid, fragments are not allowed in path templates
    assert.isTrue(test('/#baz'));
    // NOTE: the following scenarios should probably be considered invalid, should we allow RFC 6570 operators in parameter names?
    assert.isTrue(test('/{+baz}'));
    assert.isTrue(test('/{;baz}'));
    assert.isTrue(test('/{&baz}'));
    assert.isTrue(test('/{.baz}'));
    assert.isTrue(test('/{count*}'));
    assert.isTrue(test('/{y,x}'), '/{y,x}');
    // NOTE: the following scenarios should probably be considered invalid due to the use of special characters
    assert.isTrue(test('/{foo:baz}'));
    assert.isTrue(test('/{=baz}'));
    assert.isTrue(test('/{$baz}'));
    assert.isTrue(test('/{~baz}'));
    // -->
    assert.isTrue(test('/%20'));
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
    // special characters in parameter names are not allowed
    assert.isFalse(test('/{#baz}'));
    assert.isFalse(test('/{?baz}'));
    assert.isFalse(test('/{/baz}'));
    assert.isFalse(test('/{foo baz}'));
    assert.isFalse(test('/{|baz}'));
    assert.isFalse(test('/{^baz}'));
    assert.isFalse(test('/{`baz}'));
    assert.isFalse(test('/{❤️}'));
    assert.isFalse(test('/{%}'));
    // special characters in literals are not allowed
    assert.isFalse(test('/❤️'));
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
