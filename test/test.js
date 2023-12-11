import { assert } from 'chai';

import { test } from '../src/index.js'

describe('test', function () {
  it('should detect as path template', function () {
    assert.isTrue(test('/{path}'));
    assert.isTrue(test('/pets/{petId}'));
    assert.isTrue(test('/{entity}/me'));
    assert.isTrue(test('/books/{id}'));
    assert.isTrue(test('/{entity}/{another-entity}/me'));
  });

  it('should not detect expression', function () {
    assert.isTrue(test('/'));
    assert.isTrue(test('/pets/mine'));
    assert.isFalse(test(''));
    assert.isFalse(test('1'));
    assert.isFalse(test('{petId}'));
    assert.isFalse(test('/pet/{petId'));
    assert.isFalse(test(1));
    assert.isFalse(test(null));
    assert.isFalse(test(undefined));
  });
});
