import { assert } from 'chai';

import { toURITemplate, expandURITemplate, OpenAPIPathTemplatingParseError } from '../src/index.js';

const expand = (pathTemplate, parameters, values) => {
  const { uriTemplate, variables } = toURITemplate(pathTemplate, parameters);
  const data = Object.fromEntries(
    Object.entries(values).map(([name, value]) => [variables[name], value]),
  );
  return expandURITemplate(uriTemplate, data);
};

describe('toURITemplate', function () {
  specify('should convert path template into URI Template', function () {
    assert.deepEqual(toURITemplate('/pets/{petId}'), {
      uriTemplate: '/pets/{petId}',
      variables: { petId: 'petId' },
    });
  });

  specify('should use path parameter serialization', function () {
    const parameter = (fields) => [{ name: 'petId', in: 'path', ...fields }];

    assert.strictEqual(toURITemplate('/pets/{petId}', parameter({})).uriTemplate, '/pets/{petId}');
    assert.strictEqual(
      toURITemplate('/pets/{petId}', parameter({ style: 'label' })).uriTemplate,
      '/pets/{.petId}',
    );
    assert.strictEqual(
      toURITemplate('/pets/{petId}', parameter({ style: 'matrix', explode: true })).uriTemplate,
      '/pets/{;petId*}',
    );
    assert.strictEqual(
      toURITemplate('/pets/{petId}', parameter({ allowReserved: true })).uriTemplate,
      '/pets/{+petId}',
    );
    assert.strictEqual(
      toURITemplate('/pets/{petId}', parameter({ style: 'matrix', allowReserved: true }))
        .uriTemplate,
      '/pets/{;petId}',
    );
  });

  specify('should ignore parameters not in path', function () {
    const parameters = [{ name: 'petId', in: 'query', style: 'form', explode: true }, null];

    assert.strictEqual(toURITemplate('/pets/{petId}', parameters).uriTemplate, '/pets/{petId}');
  });

  specify('should consider parameters without location as path parameters', function () {
    assert.strictEqual(
      toURITemplate('/pets/{petId}', [{ name: 'petId', style: 'label' }]).uriTemplate,
      '/pets/{.petId}',
    );
  });

  specify('should pick path parameter among parameters with the same name', function () {
    const parameters = [
      { name: 'id', in: 'query', style: 'form', explode: true },
      { name: 'id', in: 'path', style: 'label' },
    ];

    assert.strictEqual(toURITemplate('/pets/{id}', parameters).uriTemplate, '/pets/{.id}');
  });

  specify('should percent-encode illegal variable names', function () {
    assert.deepEqual(toURITemplate('/{pet-id}/{❤️}/{a.b}'), {
      uriTemplate: '/{pet%2Did}/{%E2%9D%A4%EF%B8%8F}/{a%2Eb}',
      variables: { 'pet-id': 'pet%2Did', '❤️': '%E2%9D%A4%EF%B8%8F', 'a.b': 'a%2Eb' },
    });
    assert.strictEqual(expand('/pets/{pet-id}', [], { 'pet-id': 7 }), '/pets/7');
  });

  specify('should keep path literals', function () {
    assert.strictEqual(
      expand("/applications(appId='{appId}')/%7Bx%7D/", [], { appId: 'a b' }),
      "/applications(appId='a%20b')/%7Bx%7D/",
    );
  });

  specify('should throw on unsupported style', function () {
    assert.throws(
      () => toURITemplate('/pets/{petId}', [{ name: 'petId', in: 'path', style: 'form' }]),
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
    const values = {
      empty: '',
      string: 'blue',
      array: ['blue', 'black', 'brown'],
      object: { R: 100, G: 200, B: 150 },
    };
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
        const parameters = [{ name: 'color', in: 'path', style, explode }];

        Object.values(values).forEach((value, index) => {
          assert.strictEqual(
            expand('/{color}', parameters, { color: value }),
            `/${expected[index]}`,
          );
        });
      });
    });
  });
});
