# openapi-path-templating

[![npmversion](https://badge.fury.io/js/openapi-path-templating.svg)](https://www.npmjs.com/package/openapi-path-templating)
[![npm](https://img.shields.io/npm/dm/openapi-path-templating.svg)](https://www.npmjs.com/package/openapi-path-templating)
[![Test workflow](https://github.com/swaggerexpert/openapi-path-templating/actions/workflows/test.yml/badge.svg)](https://github.com/swaggerexpert/openapi-path-templating/actions)
[![Dependabot enabled](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://dependabot.com/)
[![try on RunKit](https://img.shields.io/badge/try%20on-RunKit-brightgreen.svg?style=flat)](https://npm.runkit.com/openapi-path-templating)
[![](https://data.jsdelivr.com/v1/package/npm/openapi-path-templating/badge)](https://www.jsdelivr.com/package/npm/openapi-path-templating)
[![Tidelift](https://tidelift.com/badges/package/npm/openapi-path-templating)](https://tidelift.com/subscription/pkg/npm-openapi-path-templating?utm_source=npm-openapi-path-templating&utm_medium=referral&utm_campaign=readme)

[OpenAPI Path Templating](https://spec.openapis.org/oas/v3.2.0.html#path-templating) refers to the usage of template expressions, delimited by curly braces (`{}`), to mark a section of a URL path as replaceable using path parameters.
Each template expression in the path MUST correspond to a path parameter that is included in the [Path Item](https://spec.openapis.org/oas/v3.2.0.html#path-item-object) itself and/or in each of the Path Item's [Operations](https://spec.openapis.org/oas/v3.2.0.html#operation-object).
An exception is if the path item is empty, for example due to ACL constraints, matching path parameters are not required.

`openapi-path-templating` is a **parser**, **validator**, **resolver** and **matcher** for OpenAPI Path Templating,
which played a [foundational role](https://github.com/OAI/OpenAPI-Specification/pull/4244) in defining the official ABNF grammar for OpenAPI Path Templating.

It supports Path Templating defined in following OpenAPI specification versions:

- [OpenAPI 2.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#pathTemplating)
- [OpenAPI 3.0.0](https://spec.openapis.org/oas/v3.0.0.html#path-templating)
- [OpenAPI 3.0.1](https://spec.openapis.org/oas/v3.0.1.html#path-templating)
- [OpenAPI 3.0.2](https://spec.openapis.org/oas/v3.0.2.html#path-templating)
- [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3.html#path-templating)
- [OpenAPI 3.0.4](https://spec.openapis.org/oas/v3.0.4.html#path-templating)
- [OpenAPI 3.1.0](https://spec.openapis.org/oas/v3.1.0.html#path-templating)
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html#path-templating)
- [OpenAPI 3.2.0](https://spec.openapis.org/oas/v3.2.0.html#path-templating)


<table>
  <tr>
    <td align="right" valign="middle">
        <img src="https://raw.githubusercontent.com/swaggerexpert/openapi-path-templating/main/assets/tidelift.webp" alt="Tidelift" width="60" />
      </td>
      <td valign="middle">
        <a href="https://tidelift.com/subscription/pkg/npm-openapi-path-templating?utm_source=npm-openapi-path-templating&utm_medium=referral&utm_campaign=readme">
            Get professionally supported openapi-path-templating with Tidelift Subscription.
        </a>
      </td>
  </tr>
</table>

## Table of Contents

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Parsing](#parsing)
      - [Translators](#translators)
      - [Statistics](#statistics)
      - [Tracing](#tracing)
    - [Validation](#validation)
    - [Resolution](#resolution)
      - [Parameter serialization](#parameter-serialization)
    - [URI Template](#uri-template)
    - [Regular expression](#regular-expression)
    - [Normalization](#normalization)
    - [Matching](#matching)
    - [Errors](#errors)
    - [Grammar](#grammar)
- [More about OpenAPI Path Templating](#more-about-openapi-path-templating)
- [Setting up for development](#setting-up-for-development)
- [License](#license)


## Getting started

### Installation

You can install `openapi-path-templating` using `npm`:

```sh
 $ npm install openapi-path-templating
```

---

**[unpkg.com](https://unpkg.com/)**

Include following script tag into your HTML file:

```html
<script src="https://unpkg.com/openapi-path-templating@latest/dist/openapi-path-templating.browser.min.js"></script>
```

Global variable `OpenAPIPathTemplating` will be available in the browser matching interface of `openapi-path-templating` npm package.
`openapi-path-templating.browser.min.js` is [UMD](https://github.com/umdjs/umd?tab=readme-ov-file#umd-universal-module-definition) minified build artifact.
There is also unminified `openapi-path-templating.browser.js` artifact, suitable for debugging.

---

**[jsDelivr](https://www.jsdelivr.com/)**

Include following script tag into your HTML file (ESM mode):

```html
<script type="module">
  import * as OpenAPIPathTemplating from 'https://cdn.jsdelivr.net/npm/openapi-path-templating@latest/+esm'
</script>
```
Local variable `OpenAPIPathTemplating` will be available in scope of the `<script>` tag matching interface of `openapi-path-templating` package.

Or include following script tag into your HTML file (UMD mode):

```html
<script src="https://cdn.jsdelivr.net/npm/openapi-path-templating@latest/dist/openapi-path-templating.browser.min.js"></script>
```

Global variable `OpenAPIPathTemplating` will be available in the browser matching interface of `openapi-path-templating` npm package.
`openapi-path-templating.browser.min.js` is [UMD](https://github.com/umdjs/umd?tab=readme-ov-file#umd-universal-module-definition) minified build artifact.
There is also unminified `openapi-path-templating.browser.js` artifact, suitable for debugging.

### Usage

`openapi-path-templating` currently supports **parsing**, **validation**, **resolution** and **matching**.
Both parser and validator are based on a superset of [ABNF](https://www.rfc-editor.org/rfc/rfc5234) ([SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md))
and use [apg-lite](https://github.com/ldthomas/apg-lite) parser generator.

#### Parsing

Parsing a Path Templating is as simple as importing the **parse** function and calling it.

```js
import { parse } from 'openapi-path-templating';

const parseResult = parse('/pets/{petId}');
```

**parseResult** variable has the following shape:

```
{
  result: <ParseResult['result']>,
  tree: <ParseResult['tree']>,
  stats: <ParseResult['stats']>,
  trace: <ParseResult['trace']>,
}
```

[TypeScript typings](https://github.com/swaggerexpert/openapi-path-templating/blob/main/types/index.d.ts) are available for all fields attached to parse result object returned by the `parse` function.

##### Translators

`openapi-path-templating` provides several translators to convert the parse result into different tree representations.

###### CST translator

[Concrete Syntax Tree](https://en.wikipedia.org/wiki/Parse_tree) (Parse tree) representation is available on parse result
when instance of `CSTTranslator` is provided via a `translator` option to the `parse` function.
CST is suitable to be consumed by other tools like IDEs, editors, etc...

```js
import { parse, CSTTranslator } from 'openapi-path-templating';

const { tree: cst } = parse('/pets/{petId}', { translator: new CSTTranslator() });
```

CST tree has a shape documented by [TypeScript typings (CSTNode)](https://github.com/swaggerexpert/openapi-path-templating/blob/main/types/index.d.ts).

###### AST translator

**Default translator**. [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) representation is available on parse result
by default or when instance of `ASTTranslator` is provided via a `translator` option to the `parse` function.
AST is suitable to be consumed by implementations that need to analyze the structure of the path template.

```js
import { parse } from 'openapi-path-templating';

const { tree: ast } = parse('/pets/a{petId}/');
```

or

```js
import { parse, ASTTranslator } from 'openapi-path-templating';

const { tree: ast } = parse('/pets/a{petId}/', { translator: new ASTTranslator() });
```

After running the above code, **ast** variable has the following shape:

```js
{
  type: 'PathTemplate',
  segments: [
    {
      type: 'PathSegment',
      parts: [{ type: 'PathLiteral', value: 'pets' }],
    },
    {
      type: 'PathSegment',
      parts: [
        { type: 'PathLiteral', value: 'a' },
        { type: 'TemplateExpression', name: 'petId' },
      ],
    },
  ],
  trailingSlash: true,
}
```

AST tree has a shape documented by [TypeScript typings (ASTNode)](https://github.com/swaggerexpert/openapi-path-templating/blob/main/types/index.d.ts).

###### List translator

List of entries representation is available on parse result
when instance of `ListTranslator` is provided via a `translator` option to the `parse` function.
Every entry is a `[type, text]` tuple, ordered as matched by the parser.

```js
import { parse, ListTranslator } from 'openapi-path-templating';

const { tree: list } = parse('/pets/{petId}', { translator: new ListTranslator() });
```

After running the above code, **list** variable has the following shape:

```js
[
  [ 'path-template', '/pets/{petId}' ],
  [ 'slash', '/' ],
  [ 'path-literal', 'pets' ],
  [ 'slash', '/' ],
  [ 'template-expression', '{petId}' ],
  [ 'template-expression-param-name', 'petId' ]
]
```

> NOTE: for backward compatibility, parse result also exposes the deprecated `ast` field,
> regardless of the translator used. `parseResult.ast.translate(parts)` populates `parts` with the same list of entries
> as `ListTranslator` produces. Prefer `ListTranslator` in new code.

###### XML translator

```js
import { parse, XMLTranslator } from 'openapi-path-templating';

const { tree: xml } = parse('/pets/{petId}', { translator: new XMLTranslator() });
```

##### Statistics

`parse` function returns additional statistical information about the parsing process.
Collection of the statistics can be enabled by setting `stats` option to `true`.

```js
import { parse } from 'openapi-path-templating';

const { stats } = parse('/pets/{petId}', { stats: true });

stats.displayStats(); // returns operator statistics as string
stats.displayHits(); // returns rules grouped by hit count as string
```

##### Tracing

`parse` function returns additional tracing information about the parsing process.
Tracing can be enabled by setting `trace` option to `true`. Tracing is essential
for debugging failed parses or analyzing rule execution flow.

```js
import { parse } from 'openapi-path-templating';

const { result, trace } = parse('pets', { trace: true });

result.success; // false
trace.displayTrace(); // returns trace information as string
```

Tracing also allows you to infer expected tokens at a failure point. This is useful for generating meaningful syntax error messages.

```js
import { parse } from 'openapi-path-templating';

const { trace } = parse('pets', { trace: true });

const expectations = trace.inferExpectations();
expectations.toString(); // => '"/"'
```

#### Validation

Validating a Path Templating is as simple as importing the **test** function and calling it.


```js
import { test } from 'openapi-path-templating';

test('/pets/{petId}'); // => true
test('/a{petId}'); // => true
test('/pets'); // => true
test('/pets', { strict: true }); // => false (doesn't contain any template-expression)
test('/pets/{id}/owners/{id}'); // => false (repeated template expression name)
```

Each template expression must not appear more than once in a single path template.

#### Resolution

Resolving a Path Templating is as simple as importing the **resolve** function and calling it.

```js
import { resolve } from 'openapi-path-templating';

resolve('/pets/{petId}', { petId: 3 }); // => "/pets/3"
```

Resolved Path Templating is automatically encoded using [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function.
It is possible to provide a custom encoder.

```js
import { resolve } from 'openapi-path-templating';

resolve('/pets/{petId}', { petId: '/?#' }, {
  encoder: (pathSegment) => pathSegment, // no encoding
}); // => "/pets//?#"
```

##### Parameter serialization

Path parameters are serialized according to `style`, `explode` and `allowReserved` fields of their
[Parameter Objects](https://spec.openapis.org/oas/v3.2.0.html#parameter-object), which are defined in terms of
[RFC 6570 URI Templates](https://www.rfc-editor.org/rfc/rfc6570) (see [Appendix C](https://spec.openapis.org/oas/v3.2.0.html#appendix-c-using-rfc6570-based-serialization)
of the OpenAPI Specification). Providing Parameter Objects via `parameterObjects` option serializes the values this way.

```js
import { resolve } from 'openapi-path-templating';

const parameterObjects = [{ name: 'petId', in: 'path', style: 'matrix', explode: true }];

resolve('/pets/{petId}', { petId: [3, 4] }, { parameterObjects }); // => '/pets/;petId=3;petId=4'
resolve('/pets/{petId}', { petId: { R: 100, G: 200 } }, { parameterObjects }); // => '/pets/;R=100;G=200'
```

Parameter Objects are path parameters by default, so their `in` field can be omitted. Parameter Objects with `in` other than `path`
(query, header or cookie parameters) are ignored, so `parameters` of an Operation Object can be provided as they are.
Template expressions without a Parameter Object use default serialization (`style: 'simple'`, `explode: false`),
and template expressions without a value are kept unresolved.

When `parameterObjects` option is provided, even an empty array, all values are encoded according to RFC 6570 rules,
which differ from the default encoding: percent-encoded values are encoded again, and `[` and `]` are percent-encoded.
`parameterObjects` and `encoder` options cannot be used together.

```js
import { resolve } from 'openapi-path-templating';

resolve('/pets/{petId}', { petId: '[a%20b]' }); // => '/pets/[a%20b]'
resolve('/pets/{petId}', { petId: '[a%20b]' }, { parameterObjects: [] }); // => '/pets/%5Ba%2520b%5D'
```

#### URI Template

Parameter serialization is built on two functions, which can be used separately.

**toURITemplate** converts Path Templating into a URI Template using Parameter Objects of path parameters.

```js
import { toURITemplate } from 'openapi-path-templating';

toURITemplate('/pets/{petId}', [{ name: 'petId', style: 'matrix', explode: true }]); // => '/pets/{;petId*}'
```

| Parameter Object field | URI Template |
|---|---|
| `style: 'simple'` (default) | `{petId}` |
| `style: 'label'` | `{.petId}` |
| `style: 'matrix'` | `{;petId}` |
| `explode: true` | `{petId*}` |
| `allowReserved: true` | `{+petId}` (only for `style: 'simple'`, as RFC 6570 allows a single operator) |

Template expression names that are not valid URI Template variable names are percent-encoded,
as described in [Appendix C.4.4](https://spec.openapis.org/oas/v3.2.0.html#illegal-variable-names-as-parameter-names).
Values for such variables must be provided under the percent-encoded names, which [parameter serialization](#parameter-serialization) does automatically.

```js
import { toURITemplate } from 'openapi-path-templating';

toURITemplate('/pets/{pet-id}'); // => '/pets/{pet%2Did}'
```

**expandURITemplate** expands any URI Template, encoding the values according to RFC 6570 rules.
`expandURITemplate`, **parseURITemplate** and **testURITemplate** are **100% compliant**
with the [URI Template test suite](https://github.com/uri-templates/uritemplate-test).
Single quote `'` is allowed in literals, as per [verified erratum 6937](https://www.rfc-editor.org/errata/eid6937).

```js
import { expandURITemplate, parseURITemplate, testURITemplate } from 'openapi-path-templating';

expandURITemplate('/pets/{;petId*}', { petId: [3, 4] }); // => '/pets/;petId=3;petId=4'
expandURITemplate('/search{?q,lang}', { q: 'cat dog', lang: 'en' }); // => '/search?q=cat%20dog&lang=en'
expandURITemplate('{+path}', { path: '/foo/bar' }); // => '/foo/bar'

testURITemplate('/search{?q,lang}'); // => true
testURITemplate('{/id*'); // => false
testURITemplate('{!id}'); // => false (operator reserved for future extensions)

parseURITemplate('{?q:3}').tree;
// => { type: 'URITemplate', parts: [{ type: 'Expression', operator: '?', variables: [{ name: 'q', prefix: 3, explode: false }] }] }
```

Invalid URI Template causes `OpenAPIPathTemplatingParseError` to be thrown by `expandURITemplate`.

#### Regular expression

Path Templating can be converted into a regular expression by importing the **toRegExp** function and calling it.
Regular expression has a capturing group for every template expression, in the same order as template expressions
appear in the path template.

```js
import { toRegExp } from 'openapi-path-templating';

const regExp = toRegExp('/pets/{petId}/owners/{ownerId}');

regExp.test('/pets/1/owners/2'); // => true
regExp.exec('/pets/1/owners/2'); // => ['/pets/1/owners/2', '1', '2']
regExp.test('/pets/1/owners/2/toys'); // => false
```

Template expression matches one or more characters except `/`, `?` and `#`, and percent-encoded octet is matched as a whole.
Captured values are not decoded. Path literals are matched case-sensitively, except hexadecimal digits of percent-encoded octets.
Trailing slash is significant, `/pets` and `/pets/` are different paths.

```js
import { toRegExp } from 'openapi-path-templating';

const regExp = toRegExp('/pets/{petId}');

regExp.exec('/pets/a%2Fb'); // => ['/pets/a%2Fb', 'a%2Fb']
regExp.test('/pets/a/b'); // => false
regExp.test('/pets/1/'); // => false
```

When path segment contains multiple template expressions, the value is split at the first occurrence of the path literal
between them, and template expression followed directly by another template expression matches a single character.
Regular expression never backtracks catastrophically, so matching takes linear time even for untrusted input.

```js
import { toRegExp } from 'openapi-path-templating';

toRegExp('/files/{name}.{ext}').exec('/files/report.tar.gz'); // => ['/files/report.tar.gz', 'report', 'tar.gz']
toRegExp('/{a}{b}').exec('/xyz'); // => ['/xyz', 'x', 'yz']
```

Following options are supported:

- `prefix` (default: `false`) - when `true`, the regular expression matches path prefix that ends at segment boundary, query or fragment
- `optionalTrailingSlash` (default: `false`) - when `true`, the regular expression matches optional trailing slash
- `caseSensitive` (default: `true`) - when `false`, path literals are matched case-insensitively

```js
import { toRegExp } from 'openapi-path-templating';

toRegExp('/api/{version}', { prefix: true }).exec('/api/v1/pets'); // => ['/api/v1', 'v1']
toRegExp('/pets', { optionalTrailingSlash: true }).test('/pets/'); // => true
toRegExp('/Pets', { caseSensitive: false }).test('/pets'); // => true
```

Invalid path template causes `OpenAPIPathTemplatingParseError` to be thrown.

#### Normalization

Normalization of OpenAPI Path Template is a process of transforming the path template into its normalized form.
Normalization is used to compare two path templates for equivalence and is based on **Syntax-Based Normalization** as defined in [RFC 3986, section 6.2.2](https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2).

##### Syntax-Based normalization

Syntax-Based normalization is a process of transforming the path template into its normalized form using
a fixed set of normalizers in following order:

- [Case normalization](#case-normalization)
- [Percent-Encoding normalization](#percent-encoding-normalization)
- [Path segment normalization](#path-segment-normalization)

```js
import { normalize } from 'openapi-path-templating';

normalize('/api/{userId}/profile/../account/%41ccount'); // => '/api/{userId}/account/Account'
```

Syntax-Based normalization is a default normalization strategy used by this library.


###### No normalization

Noop normalizer that acts as identity function. Performs no transformations on the path template
and returns it as is.

```js
import { identityNormalizer } from 'openapi-path-templating';

identityNormalizer('/API/%2faPi/%7bsection%7d/./../profile'); // => '/API/%2faPi/%7bsection%7d/./../profile'
```

###### Case normalization

For all path templates, the hexadecimal digits within a percent-encoding
triplet (e.g., `"%3a"` versus `"%3A"`) are case-insensitive and therefore
should be normalized to use uppercase letters for the digits A-F.

```js
import { caseNormalizer } from 'openapi-path-templating';

caseNormalizer('/api/{userId}/profile/%7bsection%7d'); // => '/api/{userId}/profile/%7Bsection%7D'
```

###### Percent-Encoding normalization

The percent-encoding mechanism is a frequent source of
variance among otherwise identical path templates. In addition to the case
normalization issue noted above, some path template producers percent-encode
octets that do not require percent-encoding, resulting in path templates that
are equivalent to their non-encoded counterparts. These path templates should
be normalized by decoding any percent-encoded octet that corresponds
to an unreserved character.

```js
import { percentEncodingNormalizer } from 'openapi-path-templating';

percentEncodingNormalizer('/api/%7BuserId%7D/profile/%41ccount/{account}'); // => '/api/%7BuserId%7D/profile/Account/{account}'
```

###### Path segment normalization

The complete path segments `"."` and `".."` are intended for use
within path templates and are removed as part of
the reference resolution process. Path template segment normalizer removes
dot-segments by applying the [remove_dot_segments](https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4) algorithm to the path template.

```js
import { pathSegmentNormalizer } from 'openapi-path-templating';

pathSegmentNormalizer('/api/{userId}/./profile/../account'); // => '/api/{userId}/account'
```

**NOTE**: note that all normalizers acts as identity functions when invalid path template is provided.

#### Matching

Path templating matching in OpenAPI prioritizes concrete paths over parameterized ones,
treats paths with identical structures but different parameter names as invalid,
and considers paths with overlapping patterns that could match the same request as potentially ambiguous.

##### Equivalence

`isIdentical`

Determines whether two path templates are structurally identical, meaning they have the same sequence
of literals and template expressions, regardless of template expression names. In the OpenAPI context,
such identical paths are considered invalid due to potential conflicts in routing.

Testing path templates for equality is normally based on pair comparison of the
characters that make up the strings, starting from the first and
proceeding until both strings are exhausted and all characters are
found to be equal, until a pair of characters compares unequal, or
until one of the strings is exhausted before the other. More in [RFC 3986, section 6.2.1](https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.1).

```js
import { isIdentical } from 'openapi-path-templating';

isIdentical('/pets/{petId}', '/pets/{name}'); // => true
isIdentical('/pets/{petId}', '/animals/{name}'); // => false
```

By default, extensive [normalization](#normalization) prior to comparison is applied to produce a normalized form of the path template.

```js
import { isIdentical, normalize, identityNormalizer } from 'openapi-path-templating';

// default behavior
isIdentical('/API/%2faPi/%7bsection%7d/./../profile', '/API/%2FaPi/profile'); // => true
isIdentical('/api/{userId}/account/Account', '/api/{userId}/profile/../account/%41ccount'); // => true
// equivalent to above
isIdentical('/API/%2faPi/%7bsection%7d/./../profile', '/API/%2FaPi/profile', { normalizer: normalize }); // => true
isIdentical('/api/{userId}/account/Account', '/api/{userId}/profile/../account/%41ccount', { normalizer: normalize }); // => true
// no normalization
isIdentical('/API/%2faPi/%7bsection%7d/./../profile', '/API/%2FaPi/profile', { normalizer: identityNormalizer }); // => false
isIdentical('/api/{userId}/account/Account', '/api/{userId}/profile/../account/%41ccount', { normalizer: identityNormalizer }); // => false
```

##### Ambiguity

`isAmbiguous`

Determines whether two path templates may lead to ambiguous resolution. Two path templates are ambiguous when
there is a concrete path matched by both of them and neither of them is more concrete than the other,
so the concrete path cannot be unambiguously matched to one of them.

Template expression matches one or more characters except `/`, and percent-encoded octet is matched as a single character.
One path template is more concrete than the other when every path matched by it is also matched by the other one.
Identical path templates are not considered ambiguous, use [isIdentical](#equivalence) to detect them.

> NOTE: OpenAPI specification only states that concrete (non-templated) paths are matched before their templated counterparts.
> It doesn't define which of two templated path templates is more concrete (see [OAI/OpenAPI-Specification#2564](https://github.com/OAI/OpenAPI-Specification/issues/2564)).
> This library extends the rule: when one path template is more concrete than the other, it is assumed to be matched first,
> and the path templates are not considered ambiguous (e.g. `/shops/{shopId}/pets/_search` and `/shops/{shopId}/pets/{petId}`).

```js
import { isAmbiguous } from 'openapi-path-templating';

isAmbiguous('/{entity}/me', '/books/{id}'); // => true (/books/me is matched by both)
isAmbiguous('/files/{name}.json', '/files/report.{ext}'); // => true (/files/report.json is matched by both)
isAmbiguous('/pets/{petId}', '/pets/mine'); // => false (/pets/mine is more concrete)
isAmbiguous('/shops/{shopId}/pets/{petId}', '/shops/{shopId}/pets/_search'); // => false (/shops/{shopId}/pets/_search is more concrete)
isAmbiguous('/pets/{petId}', '/pets/{name}'); // => false (identical)
isAmbiguous('/pets/{petId}', '/animals/{name}'); // => false (no common path)
```

By default, [normalization](#normalization) is applied to path templates prior to establishing ambiguity.
Custom normalizer can be provided via `normalizer` option.

```js
import { isAmbiguous, identityNormalizer } from 'openapi-path-templating';

isAmbiguous('/{entity}/me', '/books/./{id}'); // => true
isAmbiguous('/{entity}/me', '/books/./{id}', { normalizer: identityNormalizer }); // => false
```

##### Path matching

`match`

Matches concrete path against path templates. `match` compiles path templates once and returns a function,
which matches a concrete path and returns the matching path template together with decoded values
of its template expressions, or `null` when no path template matches.

```js
import { match } from 'openapi-path-templating';

const matchPath = match(['/pets/{petId}', '/pets/mine']);

matchPath('/pets/mine'); // => { pathTemplate: '/pets/mine', parameters: {} }
matchPath('/pets/7'); // => { pathTemplate: '/pets/{petId}', parameters: { petId: '7' } }
matchPath('/owners/1'); // => null
```

Concrete path templates are matched before templated ones, and more concrete path templates are matched
before less concrete ones (see [Ambiguity](#ambiguity)). [Ambiguous](#ambiguity) path templates are matched in list order.
Router-like matching, where the first path template in the list that matches wins, is available via `precedence` option.

```js
import { match } from 'openapi-path-templating';

match(['/pets/{petId}', '/pets/mine'], { precedence: 'order' })('/pets/mine');
// => { pathTemplate: '/pets/{petId}', parameters: { petId: 'mine' } }
```

Values of template expressions are decoded using [decodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent),
making `match` the inverse of [resolve](#resolution). Because template expression values never contain unescaped `/`,
the encoded `/` is matched as part of the value.

```js
import { match } from 'openapi-path-templating';

const matchPath = match(['/repos/{owner}/{repo}', '/repos/{owner}/{repo}/contents/{path}']);

matchPath('/repos/acme/site/contents/docs%2Findex.md');
// => { pathTemplate: '/repos/{owner}/{repo}/contents/{path}', parameters: { owner: 'acme', repo: 'site', path: 'docs/index.md' } }
matchPath('/repos/acme/site/contents/docs/index.md'); // => null
```

Query and fragment are ignored. Path that doesn't start with `/` or contains malformed percent-encoding never matches.
To match a full URL, pass its path: `matchPath(new URL(url).pathname)`.

Following options are supported:

- `precedence` (default: `'concrete'`) - `'concrete'` matches more concrete path templates first, `'order'` matches path templates in list order
- `decode` (default: `decodeURIComponent`) - function decoding template expression values, or `false` to keep them encoded
- `normalizer` (default: `identityNormalizer`) - [normalizer](#normalization) applied to path templates and the path before matching
- `prefix`, `optionalTrailingSlash` and `caseSensitive` - see [Regular expression](#regular-expression)

```js
import { match, normalize } from 'openapi-path-templating';

match('/files/{path}', { decode: false })('/files/docs%2Findex.md'); // => { pathTemplate: '/files/{path}', parameters: { path: 'docs%2Findex.md' } }
match('/pets/mine', { normalizer: normalize })('/pets/%6Dine'); // => { pathTemplate: '/pets/mine', parameters: {} }
match('/api/{version}', { prefix: true })('/api/v1/pets'); // => { pathTemplate: '/api/{version}', parameters: { version: 'v1' } }
```

Invalid path template causes `OpenAPIPathTemplatingParseError` to be thrown when compiling.

#### Errors

`openapi-path-templating` provides a structured error class hierarchy,
enabling precise error handling across path templating operations.

```js
import { OpenAPIPathTemplatingError, OpenAPIPathTemplatingParseError } from 'openapi-path-templating';
```

**OpenAPIPathTemplatingError** is the base class for all errors. **OpenAPIPathTemplatingParseError** is thrown when parsing fails unexpectedly
and includes additional context about the path template that failed to parse.
Passing a non-string value to the `parse` function throws a `TypeError`.

```js
import { parse, OpenAPIPathTemplatingParseError } from 'openapi-path-templating';

try {
  parse('/pets/{petId}');
} catch (error) {
  if (error instanceof OpenAPIPathTemplatingParseError) {
    console.log(error.pathTemplate); // the path template that failed to parse
  }
}
```

#### Grammar

New grammar instance can be created in following way:

```js
import { Grammar } from 'openapi-path-templating';

const grammar = new Grammar();
```

To obtain original ABNF (SABNF) grammar as a string:

```js
import { Grammar } from 'openapi-path-templating';

const grammar = new Grammar();

grammar.toString();
// or
String(grammar);
```

## More about OpenAPI Path Templating

The Path Templating is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax

```abnf
; OpenAPI Path Templating ABNF syntax
; variant of https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
path-template                  = slash *( path-segment slash ) [ path-segment ]
path-segment                   = 1*( path-literal / template-expression )
slash                          = "/"
path-literal                   = 1*pchar
template-expression            = "{" template-expression-param-name "}"
template-expression-param-name = 1*( %x00-7A / %x7C / %x7E-10FFFF ) ; every UTF8 character except { and } (from OpenAPI)

; https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
pchar               = unreserved / pct-encoded / sub-delims / ":" / "@"
unreserved          = ALPHA / DIGIT / "-" / "." / "_" / "~"
                    ; https://datatracker.ietf.org/doc/html/rfc3986#section-2.3
pct-encoded         = "%" HEXDIG HEXDIG
                    ; https://datatracker.ietf.org/doc/html/rfc3986#section-2.1
sub-delims          = "!" / "$" / "&" / "'" / "(" / ")"
                    / "*" / "+" / "," / ";" / "="
                    ; https://datatracker.ietf.org/doc/html/rfc3986#section-2.2

; https://datatracker.ietf.org/doc/html/rfc5234#appendix-B.1
ALPHA               = %x41-5A / %x61-7A   ; A-Z / a-z
DIGIT               = %x30-39            ; 0-9
HEXDIG              = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
```

## Setting up for development

```sh
 # Clone with submodules (recommended)
 $ git clone --recurse-submodules https://github.com/swaggerexpert/openapi-path-templating.git

 # Or initialize submodules after cloning
 $ git submodule update --init

 # Install dependencies
 $ npm install
```

The project uses the [URI Template test suite](https://github.com/uri-templates/uritemplate-test) as a git submodule for testing.

## License

`openapi-path-templating` is licensed under [Apache 2.0 license](https://github.com/swaggerexpert/openapi-path-templating/blob/main/LICENSE).
`openapi-path-templating` comes with an explicit [NOTICE](https://github.com/swaggerexpert/openapi-path-templating/blob/main/NOTICE) file
containing additional legal notices and information.
