import { assert } from 'chai';

import { match, normalize, OpenAPIPathTemplatingParseError } from '../../src/index.js';

describe('matching', function () {
  context('match', function () {
    specify('should match path against single path template', function () {
      const matchPet = match('/pets/{petId}');

      assert.deepEqual(matchPet('/pets/7'), {
        pathTemplate: '/pets/{petId}',
        parameters: { petId: '7' },
      });
      assert.isNull(matchPet('/owners/1'));
    });

    specify('should match concrete path template before templated one', function () {
      const matchPath = match(['/pets/{petId}', '/pets/mine']);

      assert.deepEqual(matchPath('/pets/mine'), { pathTemplate: '/pets/mine', parameters: {} });
      assert.deepEqual(matchPath('/pets/7'), {
        pathTemplate: '/pets/{petId}',
        parameters: { petId: '7' },
      });
    });

    specify('should match more concrete templated path template first', function () {
      const matchPath = match(['/{a}/{b}', '/x/{b}', '/x/y']);

      assert.strictEqual(matchPath('/x/y').pathTemplate, '/x/y');
      assert.strictEqual(matchPath('/x/z').pathTemplate, '/x/{b}');
      assert.strictEqual(matchPath('/w/z').pathTemplate, '/{a}/{b}');
    });

    specify('should match ambiguous path templates in list order', function () {
      assert.strictEqual(
        match(['/{entity}/me', '/books/{id}'])('/books/me').pathTemplate,
        '/{entity}/me',
      );
      assert.strictEqual(
        match(['/books/{id}', '/{entity}/me'])('/books/me').pathTemplate,
        '/books/{id}',
      );
    });

    specify('should skip path template with malformed percent-encoding in values', function () {
      assert.deepEqual(match(['/{a}/x', '/%FF/{b}'])('/%FF/x'), {
        pathTemplate: '/%FF/{b}',
        parameters: { b: 'x' },
      });
      assert.deepEqual(match(['/pets/{id}', '/pets/%FF'], { precedence: 'order' })('/pets/%FF'), {
        pathTemplate: '/pets/%FF',
        parameters: {},
      });
    });

    specify('should match path templates regardless of their first path segment', function () {
      const matchPath = match(['/{entity}/{id}', '/pets/{id}', '/owners/{id}', '/']);

      assert.strictEqual(matchPath('/pets/1').pathTemplate, '/pets/{id}');
      assert.strictEqual(matchPath('/owners/1').pathTemplate, '/owners/{id}');
      assert.strictEqual(matchPath('/books/1').pathTemplate, '/{entity}/{id}');
      assert.strictEqual(matchPath('/').pathTemplate, '/');
      assert.strictEqual(match('/%7e/{x}')('/%7E/1').pathTemplate, '/%7e/{x}');
    });

    specify('should decode template expression values', function () {
      const matchPath = match(['/repos/{owner}/{repo}', '/repos/{owner}/{repo}/contents/{path}']);

      assert.deepEqual(matchPath('/repos/acme/site/contents/docs%2Findex.md'), {
        pathTemplate: '/repos/{owner}/{repo}/contents/{path}',
        parameters: { owner: 'acme', repo: 'site', path: 'docs/index.md' },
      });
      assert.isNull(matchPath('/repos/acme/site/contents/docs/index.md'));
    });

    specify('should ignore query and fragment', function () {
      const matchPet = match('/pets/{petId}');

      assert.deepEqual(matchPet('/pets/7?offset=0#details').parameters, { petId: '7' });
      assert.deepEqual(matchPet('/pets/7#details?x').parameters, { petId: '7' });
    });

    specify('should not match invalid paths', function () {
      const matchPet = match('/pets/{petId}');

      assert.isNull(matchPet('pets/7'));
      assert.isNull(matchPet(''));
      assert.isNull(matchPet('?/pets/7'));
      assert.isNull(matchPet(1));
      assert.isNull(matchPet('/pets/%E0%A4%A'));
    });

    specify('should support any template expression names', function () {
      assert.deepEqual(match('/{pet-id}/{$1}/{__proto__}')('/a/b/c').parameters, {
        'pet-id': 'a',
        $1: 'b',
        ['__proto__']: 'c',
      });
    });

    context('given precedence option', function () {
      specify('should match path templates in list order', function () {
        const matchPath = match(['/pets/{petId}', '/pets/mine'], { precedence: 'order' });

        assert.deepEqual(matchPath('/pets/mine'), {
          pathTemplate: '/pets/{petId}',
          parameters: { petId: 'mine' },
        });
      });

      specify('should throw on unsupported precedence', function () {
        assert.throws(() => match('/pets', { precedence: 'random' }), TypeError);
      });
    });

    context('given decode option', function () {
      specify('should not decode values', function () {
        assert.deepEqual(
          match('/files/{path}', { decode: false })('/files/docs%2Findex.md').parameters,
          {
            path: 'docs%2Findex.md',
          },
        );
      });

      specify('should throw on invalid decode option', function () {
        assert.throws(() => match('/pets/{id}', { decode: true }), TypeError);
      });

      specify('should propagate errors of custom decoder', function () {
        const decode = () => {
          throw new Error('boom');
        };

        assert.throws(() => match('/pets/{id}', { decode })('/pets/7'), 'boom');
      });

      specify('should use custom decoder', function () {
        const decode = (value) => value.toUpperCase();

        assert.deepEqual(match('/users/{name}', { decode })('/users/john').parameters, {
          name: 'JOHN',
        });
      });
    });

    context('given normalizer option', function () {
      specify('should match path as given by default', function () {
        assert.deepEqual(match('/pets/{petId}')('/pets/..').parameters, { petId: '..' });
        assert.isNull(match('/pets/mine')('/pets/%6Dine'));
      });

      specify('should normalize path templates and path', function () {
        const matchPath = match(['/pets/mine', '/pets/{petId}'], { normalizer: normalize });

        assert.strictEqual(matchPath('/pets/%6Dine').pathTemplate, '/pets/mine');
        assert.strictEqual(matchPath('/pets/./mine').pathTemplate, '/pets/mine');
      });
    });

    context('given toRegExp options', function () {
      specify('should pass them to toRegExp', function () {
        assert.deepEqual(match('/api/{version}', { prefix: true })('/api/v1/pets').parameters, {
          version: 'v1',
        });
        assert.isNotNull(match('/pets', { optionalTrailingSlash: true })('/pets/'));
        assert.isNotNull(match('/Pets', { caseSensitive: false })('/pets'));
      });

      specify('should match more concrete path templates first', function () {
        assert.strictEqual(
          match(['/api', '/api/pets'], { prefix: true })('/api/pets/1').pathTemplate,
          '/api/pets',
        );
        assert.strictEqual(
          match(['/api', '/api/pets'], { prefix: true })('/api/owners').pathTemplate,
          '/api',
        );
        assert.strictEqual(
          match(['/pets/{id}', '/pets/mine/'], { optionalTrailingSlash: true })('/pets/mine')
            .pathTemplate,
          '/pets/mine/',
        );
        assert.strictEqual(
          match(['/pets/{id}', '/Pets/mine'], { caseSensitive: false })('/PETS/mine').pathTemplate,
          '/Pets/mine',
        );
      });
    });

    context('given invalid path template', function () {
      specify('should throw', function () {
        assert.throws(() => match('/{'), OpenAPIPathTemplatingParseError);
        assert.throws(() => match(['/pets', 1]), TypeError);
      });

      specify('should throw on repeated template expression names', function () {
        assert.throws(() => match('/pets/{id}/owners/{id}'), OpenAPIPathTemplatingParseError);
      });

      specify('should report original path template', function () {
        try {
          match('/pets/{', { normalizer: (pathTemplate) => `${pathTemplate} ` });
          assert.fail('should have thrown');
        } catch (error) {
          assert.instanceOf(error, OpenAPIPathTemplatingParseError);
          assert.strictEqual(error.pathTemplate, '/pets/{');
        }
      });
    });
  });
});
