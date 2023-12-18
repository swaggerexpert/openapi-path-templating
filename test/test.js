import { assert } from 'chai';

import { test } from '../src/index.js';

describe('test', function () {
  it('should detect as path template', function () {
    assert.isTrue(test('/{path}'));
    assert.isTrue(test('/pets/{petId}'));
    assert.isTrue(test('/{entity}/me'));
    assert.isTrue(test('/books/{id}'));
    assert.isTrue(test('/a{test}'));
    assert.isTrue(test('/{entity}/{another-entity}/me'));
    assert.isTrue(test('/'));
    assert.isTrue(test('/pets?offset={offset}&limit={limit}'));
    assert.isTrue(test('/pets?offset=0&limit=10'));
    assert.isTrue(test('/pets?offset{offset}limit={limit}'));
  });

  it('should not detect expression', function () {
    assert.isFalse(test(''));
    assert.isFalse(test('1'));
    assert.isFalse(test('{petId}'));
    assert.isFalse(test('/pet/{petId'));
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
      assert.isTrue(test('/pets/{petId}?offset={offset}&limit={limit}', { strict: true }));
    });

    specify('should not detect expression', function () {
      assert.isFalse(test('/', { strict: true }));
      assert.isFalse(test('/pets/mine', { strict: true }));
      assert.isFalse(test('/pets?offset=0&limit=10', { strict: true }));
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
