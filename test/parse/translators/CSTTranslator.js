import { assert } from 'chai';

import { parse, CSTTranslator } from '../../../src/index.js';

describe('parse', function () {
  context('translators', function () {
    context('CSTTranslator', function () {
      specify('should translate a path template to a CST', function () {
        const parseResult = parse('/pets/a{petId}', { translator: new CSTTranslator() });

        assert.isTrue(parseResult.result.success);
        assert.deepEqual(parseResult.tree, {
          type: 'path-template',
          text: '/pets/a{petId}',
          start: 0,
          length: 14,
          children: [
            { type: 'slash', text: '/', start: 0, length: 1, children: [] },
            {
              type: 'path-segment',
              text: 'pets',
              start: 1,
              length: 4,
              children: [{ type: 'path-literal', text: 'pets', start: 1, length: 4, children: [] }],
            },
            { type: 'slash', text: '/', start: 5, length: 1, children: [] },
            {
              type: 'path-segment',
              text: 'a{petId}',
              start: 6,
              length: 8,
              children: [
                { type: 'path-literal', text: 'a', start: 6, length: 1, children: [] },
                {
                  type: 'template-expression',
                  text: '{petId}',
                  start: 7,
                  length: 7,
                  children: [
                    {
                      type: 'template-expression-param-name',
                      text: 'petId',
                      start: 8,
                      length: 5,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        });
      });
    });
  });
});
