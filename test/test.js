import { assert } from 'chai';

import { test } from '../src/index.js';

describe('test', function () {
  it('should detect as path template', function () {
    assert.isTrue(test('/{path}/')); // trailing slash is allowed
    assert.isTrue(test('/pets/{petId}'));
    assert.isTrue(test('/{entity}/me'));
    assert.isTrue(test('/books/{id}'));
    assert.isTrue(test('/a{test}'));
    assert.isTrue(test('/{test}a'));
    assert.isTrue(test('/foo/bar/{baz}/test/{foo_id}/baz/{bar_id}'));
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
    assert.isTrue(test('/{foo:}'));
    assert.isTrue(test('/{foo:baz}'));
    assert.isTrue(test('/{=baz}'));
    assert.isTrue(test('/{$baz}'));
    assert.isTrue(test('/{~baz}'));
    assert.isTrue(test('/{#baz}'));
    assert.isTrue(test('/{?baz}'));
    assert.isTrue(test('/{/baz}'));
    assert.isTrue(test('/{foo baz}'));
    assert.isTrue(test('/{|baz}'));
    assert.isTrue(test('/{^baz}'));
    assert.isTrue(test('/{`baz}'));
    // RFC 6570 operators are allowed
    assert.isTrue(test('/{y,x}'));
    assert.isTrue(test('/{count*}'));
    assert.isTrue(test('/{;bar}'));
    assert.isTrue(test('/{&bar}'));
    assert.isTrue(test('/{.bar}'));
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
    // invalid types
    assert.isFalse(test(1));
    assert.isFalse(test(null));
    assert.isFalse(test(undefined));
  });

  context('given strict option', function () {
    specify('should detect as path template', function () {
      assert.isTrue(test('/{path}/', { strict: true })); // trailing slash is allowed
      assert.isTrue(test('/pets/{petId}', { strict: true }));
      assert.isTrue(test('/{entity}/me', { strict: true }));
      assert.isTrue(test('/books/{id}', { strict: true }));
      assert.isTrue(test('/a{test}', { strict: true }));
      assert.isTrue(test('/{test}a', { strict: true }));
      assert.isTrue(test('/foo/bar/{baz}/test/{foo_id}/baz/{bar_id}', { strict: true }));
      assert.isTrue(test('/range({x},{y})', { strict: true })); // parentheses are allowed
      assert.isTrue(test('/range({x},{y})/secondRange({x},{y})', { strict: true })); // repeated parameter names are allowed
      assert.isTrue(test('/{entity}/{another-entity}/me', { strict: true }));
      // some special characters in literals are allowed
      assert.isTrue(test("/applications(appId='{appId}')", { strict: true }));
      // some special characters in parameters names are allowed
      assert.isTrue(test('/users/{user-id}', { strict: true }));
      assert.isTrue(test('/{❤️}', { strict: true }));
      assert.isTrue(test('/{%}', { strict: true }));
      assert.isTrue(test('/{foo, :}', { strict: true }));
      assert.isTrue(test('/{foo:ba, z}', { strict: true }));
      assert.isTrue(test('/{=baz}', { strict: true }));
      assert.isTrue(test('/{$baz}', { strict: true }));
      assert.isTrue(test('/{~baz}', { strict: true }));
      assert.isTrue(test('/{#baz}', { strict: true }));
      assert.isTrue(test('/{?baz}', { strict: true }));
      assert.isTrue(test('/{/baz}', { strict: true }));
      assert.isTrue(test('/{foo ba, z}', { strict: true }));
      assert.isTrue(test('/{|baz}', { strict: true }));
      assert.isTrue(test('/{^baz}', { strict: true }));
      assert.isTrue(test('/{`baz}', { strict: true }));
      // RFC 6570 operators are allowed
      assert.isTrue(test('/{y,x}', { strict: true }));
      assert.isTrue(test('/{count*}', { strict: true }));
      assert.isTrue(test('/{;bar}', { strict: true }));
      assert.isTrue(test('/{&bar}', { strict: true }));
      assert.isTrue(test('/{.bar}', { strict: true }));
    });

    specify('should not detect expression', function () {
      assert.isFalse(test('', { strict: true }));
      assert.isFalse(test('1', { strict: true }));
      assert.isFalse(test('//', { strict: true }));
      assert.isFalse(test('{petId}', { strict: true }));
      assert.isFalse(test('/pet/{petId', { strict: true }));
      assert.isFalse(test('/pets?offset=0&limit=10', { strict: true }));
      assert.isFalse(test('/pets?offset={offset}&limit={limit}', { strict: true }));
      assert.isFalse(test('/pets?offset{offset}limit={limit}', { strict: true }));
      assert.isFalse(test('/#baz', { strict: true }));
      // some special characters in literals are allowed
      assert.isFalse(test('/', { strict: true }));
      assert.isFalse(test('/-/', { strict: true }));
      assert.isFalse(test('/~/', { strict: true }));
      assert.isFalse(test('/%20', { strict: true }));
      assert.isFalse(test('/functions/t_Dist_2T', { strict: true }));
      assert.isFalse(test('/users/$count', { strict: true }));
      assert.isFalse(test('/users/delta()', { strict: true }));
      assert.isFalse(test('/directoryObjects/microsoft.graph.user', { strict: true }));
      assert.isFalse(
        test("/com/on/get(meetingOrganizerUserId='@meetingOrganizerUserId')", { strict: true }),
      );
      // special characters in literals are not allowed
      assert.isFalse(test('/❤️'));
      // invalid types
      assert.isFalse(test(1, { strict: true }));
      assert.isFalse(test(null, { strict: true }));
      assert.isFalse(test(undefined, { strict: true }));
    });
  });
});
