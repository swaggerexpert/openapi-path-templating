import { assert } from 'chai';

import { resolve, encodePathComponent } from '../src/index.js';

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
    const result = resolve('/pets/{petId}?limit={limit}');

    assert.equal(result, '/pets/{petId}?limit={limit}');
  });

  it('should resolve path template with non-string parameter', function () {
    const result = resolve('/pets/{petId}', { petId: 1 });

    assert.equal(result, '/pets/1');
  });

  it('should not resolve path template with query string template expressions', function () {
    const result = resolve('/pets?offset={offset}&limit={limit}', { offset: 0, limit: 10 });

    assert.equal(result, '/pets?offset={offset}&limit={limit}');
  });

  it('should not resolve path template with fragment template expressions', function () {
    const result = resolve('/pets#{fragment}', { fragment: 'value' });

    assert.equal(result, '/pets#{fragment}');
  });

  it('should accept custom encoding function', function () {
    const result = resolve(
      '/pets/{petId}',
      { petId: '/?#' },
      {
        encoder: (component) => component,
      },
    );

    assert.equal(result, '/pets//?#');
  });

  it('should export encodePathComponent function', function () {
    assert.isFunction(encodePathComponent);
  });
});
