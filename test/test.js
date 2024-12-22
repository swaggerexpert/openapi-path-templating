import { assert } from 'chai';

import { test } from '../src/index.js';

describe('test', function () {
  it('should detect as path template', function () {
    assert.isTrue(test('/{path}'));
    assert.isTrue(test('/{path}/')); // trailing slash is allowed
    assert.isTrue(test('/pets/{petId}'));
    assert.isTrue(test('/{entity}/me'));
    assert.isTrue(test('/books/{id}'));
    assert.isTrue(test('/a{test}'));
    assert.isTrue(test('/{test}a'));
    assert.isTrue(test('/range({x},{y})')); // parentheses are allowed
    assert.isTrue(test('/range({x},{y})/secondRange({x},{y})')); // repeated parameter names are allowed
    assert.isTrue(test('/{entity}/{another-entity}/me'));
    // some special characters in literals are allowed
    assert.isTrue(test('/'));
    assert.isTrue(test('/-/'));
    assert.isTrue(test('/~/'));
    assert.isTrue(test('/%20'));
    assert.isTrue(test('/functions/t_Dist_2T'));
    assert.isTrue(test('/users/$count'));
    assert.isTrue(test('/users/delta()'));
    assert.isTrue(test('/directoryObjects/microsoft.graph.user'));
    assert.isTrue(test("/applications(appId='{appId}')"));
    assert.isTrue(test("/com/on/get(meetingOrganizerUserId='@meetingOrganizerUserId')"));
    // some special characters in parameters names are allowed
    assert.isTrue(test('/users/{user-id}'));
    assert.isTrue(test('/{❤️}'));
    assert.isTrue(test('/{%}'));
    // RFC 6570 operators
    assert.isTrue(test('/{y,x}'), '/{y,x}');
    assert.isTrue(test('/{count*}'));
  });

  it('should not detect expression', function () {
    assert.isFalse(test(''));
    assert.isFalse(test('1'));
    assert.isFalse(test('//'));
    assert.isFalse(test('{petId}'));
    assert.isFalse(test('/pet/{petId'));
    assert.isFalse(test('/pets?offset=0&limit=10'));
    assert.isFalse(test('/pets?offset={offset}&limit={limit}'));
    assert.isFalse(test('/pets?offset{offset}limit={limit}'));
    assert.isFalse(test('/#baz'));
    // special characters in literals are not allowed
    assert.isFalse(test('/❤️'));
    // special characters in parameters names are not allowed
    assert.isFalse(test('/{foo:baz}'));
    assert.isFalse(test('/{=baz}'));
    assert.isFalse(test('/{$baz}'));
    assert.isFalse(test('/{~baz}'));
    assert.isFalse(test('/{#baz}'));
    assert.isFalse(test('/{?baz}'));
    assert.isFalse(test('/{/baz}'));
    assert.isFalse(test('/{foo baz}'));
    assert.isFalse(test('/{|baz}'));
    assert.isFalse(test('/{^baz}'));
    assert.isFalse(test('/{`baz}'));
    // RFC 6570 operators
    assert.isFalse(test('/{;baz}'));
    assert.isFalse(test('/{&baz}'));
    assert.isFalse(test('/{.baz}'));
    // invalid types
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
