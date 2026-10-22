import { assert } from 'chai';

import { toURITemplate, resolve, OpenAPIPathTemplatingParseError } from '../src/index.js';

describe('toURITemplate', function () {
  specify('should convert path template into URI Template', function () {
    assert.strictEqual(toURITemplate('/pets/{petId}'), '/pets/{petId}');
    assert.strictEqual(toURITemplate('/pets/{petId}', []), '/pets/{petId}');
  });

  specify('should use path parameter serialization', function () {
    const toTemplate = (fields) => toURITemplate('/pets/{petId}', [{ name: 'petId', ...fields }]);

    assert.strictEqual(toTemplate({}), '/pets/{petId}');
    assert.strictEqual(toTemplate({ style: 'label' }), '/pets/{.petId}');
    assert.strictEqual(toTemplate({ style: 'matrix', explode: true }), '/pets/{;petId*}');
    assert.strictEqual(toTemplate({ allowReserved: true }), '/pets/{+petId}');
    assert.strictEqual(toTemplate({ style: 'matrix', allowReserved: true }), '/pets/{;petId}');
  });

  specify('should ignore parameters not in path', function () {
    const parameterObjects = [{ name: 'petId', in: 'query', style: 'form', explode: true }, null];

    assert.strictEqual(toURITemplate('/pets/{petId}', parameterObjects), '/pets/{petId}');
  });

  specify('should consider parameters without location as path parameters', function () {
    assert.strictEqual(
      toURITemplate('/pets/{petId}', [{ name: 'petId', style: 'label' }]),
      '/pets/{.petId}',
    );
  });

  specify('should pick path parameter among parameters with the same name', function () {
    const parameterObjects = [
      { name: 'id', in: 'query', style: 'form', explode: true },
      { name: 'id', in: 'path', style: 'label' },
    ];

    assert.strictEqual(toURITemplate('/pets/{id}', parameterObjects), '/pets/{.id}');
  });

  specify('should percent-encode illegal variable names', function () {
    assert.strictEqual(
      toURITemplate('/{pet-id}/{❤️}/{a.b}'),
      '/{pet%2Did}/{%E2%9D%A4%EF%B8%8F}/{a%2Eb}',
    );
  });

  specify('should keep path literals', function () {
    assert.strictEqual(
      toURITemplate("/applications(appId='{appId}')/%7Bx%7D/"),
      "/applications(appId='{appId}')/%7Bx%7D/",
    );
  });

  specify('should throw on unsupported style', function () {
    assert.throws(
      () => toURITemplate('/pets/{petId}', [{ name: 'petId', style: 'form' }]),
      TypeError,
    );
  });

  specify('should throw on invalid path template', function () {
    assert.throws(() => toURITemplate('/{'), OpenAPIPathTemplatingParseError);
  });

  /**
   * https://spec.openapis.org/oas/v3.2.0.html#style-examples
   */
  context('style examples', function () {
    const values = ['', 'blue', ['blue', 'black', 'brown'], { R: 100, G: 200, B: 150 }];
    const examples = [
      [
        'matrix',
        false,
        [';color', ';color=blue', ';color=blue,black,brown', ';color=R,100,G,200,B,150'],
      ],
      [
        'matrix',
        true,
        [';color', ';color=blue', ';color=blue;color=black;color=brown', ';R=100;G=200;B=150'],
      ],
      ['label', false, ['.', '.blue', '.blue,black,brown', '.R,100,G,200,B,150']],
      ['label', true, ['.', '.blue', '.blue.black.brown', '.R=100.G=200.B=150']],
      ['simple', false, ['', 'blue', 'blue,black,brown', 'R,100,G,200,B,150']],
      ['simple', true, ['', 'blue', 'blue,black,brown', 'R=100,G=200,B=150']],
    ];

    examples.forEach(([style, explode, expected]) => {
      specify(`style: ${style}, explode: ${explode}`, function () {
        const parameterObjects = [{ name: 'color', in: 'path', style, explode }];

        values.forEach((value, index) => {
          assert.strictEqual(
            resolve('/{color}', { color: value }, { parameterObjects }),
            `/${expected[index]}`,
          );
        });
      });
    });
  });
});
