import fs from 'node:fs';
import { assert } from 'chai';

import { expandURITemplate } from '../../src/index.js';

/**
 * https://github.com/uri-templates/uritemplate-test
 */
const suites = [
  'spec-examples.json',
  'spec-examples-by-section.json',
  'extended-tests.json',
  'negative-tests.json',
];

describe('URI Template compliance', function () {
  suites.forEach((file) => {
    const suite = JSON.parse(
      fs.readFileSync(new URL(`../uritemplate-test/${file}`, import.meta.url), 'utf8'),
    );

    context(file, function () {
      Object.entries(suite).forEach(([group, { variables, testcases }]) => {
        context(group, function () {
          testcases.forEach(([uriTemplate, expected]) => {
            specify(uriTemplate, function () {
              if (expected === false) {
                assert.throws(() => expandURITemplate(uriTemplate, variables));
                return;
              }

              const actual = expandURITemplate(uriTemplate, variables);

              if (Array.isArray(expected)) {
                assert.include(expected, actual);
              } else {
                assert.strictEqual(actual, expected);
              }
            });
          });
        });
      });
    });
  });
});
