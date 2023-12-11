import { assert } from 'chai';

import { resolve } from '../src/index.js'

describe('resolve', function () {
  it('should resolve path template with parameter', function () {
    const result = resolve('/pets/{petId}', { petId: '123' });

    assert.equal(result, '/pets/123');
  });

  it('should resolve multiple path templates with parameter', function () {
    const result = resolve('/pets/{petId}/{petId}', { petId: '123' });

    assert.equal(result, '/pets/123/123');
  });

  it('should encode characters using encodeURIComponent', function () {
    const result = resolve('/pets/{petId}', { petId: '/?#' });

    assert.equal(result, '/pets/%2F%3F%23');
  });

  it('should encode "generic syntax" characters described by RFC3986', function () {
    const result = resolve('/pets/{petId}', { petId: '/?#' });

    assert.equal(result, '/pets/%2F%3F%23');
  });

  it('should resolve path template with empty value', function () {
    const result = resolve('/pets/{petId}/test', { petId: '' });

    assert.equal(result, '/pets//test');
  });

  it('should do nothing on missing parameter', function () {
    const result = resolve('/pets/{petId}');

    assert.equal(result, '/pets/{petId}');
  });

  it('should resolve path template with non-string parameter', function () {
    const result = resolve('/pets/{petId}', { petId: 1 });

    assert.equal(result, '/pets/1');
  });
});
