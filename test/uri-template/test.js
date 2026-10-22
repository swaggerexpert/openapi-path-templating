import { assert } from 'chai';

import { testURITemplate } from '../../src/index.js';

describe('testURITemplate', function () {
  specify('should detect URI Template', function () {
    assert.isTrue(testURITemplate('/pets/{petId}'));
    assert.isTrue(testURITemplate('http://example.com/search{?q,lang}'));
    assert.isTrue(testURITemplate("/applications(appId='{appId}')")); // erratum 6937
    assert.isTrue(testURITemplate('/{%E2%9D%A4%EF%B8%8F}'));
    assert.isTrue(testURITemplate(''));
  });

  specify('should not detect invalid URI Template', function () {
    assert.isFalse(testURITemplate('{/id*'));
    assert.isFalse(testURITemplate('{var:prefix}'));
    assert.isFalse(testURITemplate('{pet-id}'));
    assert.isFalse(testURITemplate('{var:10000}'));
    assert.isFalse(testURITemplate(1));
  });

  specify('should not detect URI Template with reserved operators', function () {
    assert.isFalse(testURITemplate('{!hello}'));
    assert.isFalse(testURITemplate('{=path}'));
  });
});
