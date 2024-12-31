# openapi-path-templating

[![npmversion](https://badge.fury.io/js/openapi-path-templating.svg)](https://www.npmjs.com/package/openapi-path-templating)
[![npm](https://img.shields.io/npm/dm/openapi-path-templating.svg)](https://www.npmjs.com/package/openapi-path-templating)
[![Test workflow](https://github.com/swaggerexpert/openapi-path-templating/actions/workflows/test.yml/badge.svg)](https://github.com/swaggerexpert/openapi-path-templating/actions)
[![Dependabot enabled](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://dependabot.com/)
[![try on RunKit](https://img.shields.io/badge/try%20on-RunKit-brightgreen.svg?style=flat)](https://npm.runkit.com/openapi-path-templating)
[![Tidelift](https://tidelift.com/badges/package/npm/openapi-path-templating)](https://tidelift.com/subscription/pkg/npm-openapi-path-templating?utm_source=npm-openapi-path-templating&utm_medium=referral&utm_campaign=readme)

[OpenAPI Path Templating](https://spec.openapis.org/oas/v3.1.1.html#path-templating) refers to the usage of template expressions, delimited by curly braces (`{}`), to mark a section of a URL path as replaceable using path parameters.
Each template expression in the path MUST correspond to a path parameter that is included in the [Path Item](https://spec.openapis.org/oas/v3.1.1.html#path-item-object) itself and/or in each of the Path Item's [Operations](https://spec.openapis.org/oas/v3.1.1.html#operation-object).
An exception is if the path item is empty, for example due to ACL constraints, matching path parameters are not required.

`openapi-path-templating` is a **parser**, **validator**, **resolver** and **matcher** for OpenAPI Path Templating,
which played a [foundational role](https://github.com/OAI/OpenAPI-Specification/pull/4244) in defining the official ANBF grammar for OpenAPI Path Templating.

It supports Path Templating defined in following OpenAPI specification versions:

- [OpenAPI 2.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#pathTemplating)
- [OpenAPI 3.0.0](https://spec.openapis.org/oas/v3.0.0.html#path-templating)
- [OpenAPI 3.0.1](https://spec.openapis.org/oas/v3.0.1.html#path-templating)
- [OpenAPI 3.0.2](https://spec.openapis.org/oas/v3.0.2.html#path-templating)
- [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3.html#path-templating)
- [OpenAPI 3.0.4](https://spec.openapis.org/oas/v3.0.4.html#path-templating)
- [OpenAPI 3.1.0](https://spec.openapis.org/oas/v3.1.0.html#path-templating)
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html#path-templating)


<table>
  <tr>
    <td align="right" valign="middle">
        <img src="https://cdn2.hubspot.net/hubfs/4008838/website/logos/logos_for_download/Tidelift_primary-shorthand-logo.png" alt="Tidelift" width="60" />
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
    - [Validation](#validation)
    - [Resolution](#resolution)
    - [Matching](#matching)
    - [Grammar](#grammar)
- [More about OpenAPI Path Templating](#more-about-openapi-path-templating)
- [License](#license)


## Getting started

### Installation

You can install `openapi-path-templating` using `npm`:

```sh
 $ npm install openapi-path-templating
```

### Usage

`openapi-path-templating` currently supports **parsing**, **validation**, **resolution** and **matching**.
Both parser and validator are based on a superset of [ABNF](https://www.rfc-editor.org/rfc/rfc5234) ([SABNF](https://github.com/ldthomas/apg-js2/blob/master/SABNF.md))
and use [apg-lite](https://github.com/ldthomas/apg-lite) parser generator.

#### Parsing

Parsing a Path Templating is as simple as importing the **parse** function
and calling it.

```js
import { parse } from 'openapi-path-templating';

const parseResult = parse('/pets/{petId}');
parseResult.result.success; // => true
```

**parseResult** variable has the following shape:

```
{
  result: {
    success: true,
    state: 101,
    stateName: 'MATCH',
    length: 13,
    matched: 13,
    maxMatched: 13,
    maxTreeDepth: 20,
    nodeHits: 232
  },
  ast: fnast {
    callbacks: [
      'path-template': [Function: pathTemplate],
      slash: [Function: slash],
      'path-literal': [Function: pathLiteral],
      'template-expression': [Function: templateExpression],
      'template-expression-param-name': [Function: templateExpressionParamName]
    ],
    init: [Function (anonymous)],
    ruleDefined: [Function (anonymous)],
    udtDefined: [Function (anonymous)],
    down: [Function (anonymous)],
    up: [Function (anonymous)],
    translate: [Function (anonymous)],
    setLength: [Function (anonymous)],
    getLength: [Function (anonymous)],
    toXml: [Function (anonymous)]
  }
}
```

###### Interpreting AST as list of entries

```js
import { parse } from 'openapi-path-templating';

const parseResult = parse('/pets/{petId}');
const parts = [];

parseResult.ast.translate(parts);
```

After running the above code, **parts** variable has the following shape:

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

###### Interpreting AST as XML

```js
import { parse } from 'openapi-path-templating';

const parseResult = parse('/pets/{petId}');
const xml = parseResult.ast.toXml();
```

After running the above code, **xml** variable has the following content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<root nodes="6" characters="13">
  <!-- input string -->
  /pets/{petId}
  <node name="path-template" index="0" length="13">
    /pets/{petId}
    <node name="slash" index="0" length="1">
      /
    </node><!-- name="slash" -->
    <node name="path-literal" index="1" length="4">
      pets
    </node><!-- name="path-literal" -->
    <node name="slash" index="5" length="1">
      /
    </node><!-- name="slash" -->
    <node name="template-expression" index="6" length="7">
      {petId}
      <node name="template-expression-param-name" index="7" length="5">
        petId
      </node><!-- name="template-expression-param-name" -->
    </node><!-- name="template-expression" -->
  </node><!-- name="path-template" -->
</root>
```

> NOTE: AST can also be traversed in classical way using [depth first traversal](https://www.tutorialspoint.com/data_structures_algorithms/depth_first_traversal.htm). For more information about this option please refer to [apg-js](https://github.com/ldthomas/apg-js) and [apg-js-examples](https://github.com/ldthomas/apg-js-examples).

#### Validation

Validating a Path Templating is as simple as importing the **test** function and calling it.


```js
import { test } from 'openapi-path-templating';

test('/pets/{petId}'); // => true
test('/a{petId}'); // => true
test('/pets'); // => true
test('/pets', { strict: true }); // => false (doesn't contain any template-expression)
```

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
  encoder: (component) => component, // no encoding
}); // => "/pets//?#"
```

#### Matching

Path templating matching in OpenAPI prioritizes concrete paths over parameterized ones,
treats paths with identical structures but different parameter names as invalid,
and considers paths with overlapping patterns that could match the same request as potentially ambiguous.

##### Predicates

`isIdentical`

Determines whether two path templates are structurally identical, meaning they have the same sequence
of literals and template expressions, regardless of template expression names. In the OpenAPI context,
such identical paths are considered invalid due to potential conflicts in routing.

```js
import { isIdentical } from 'openapi-path-templating';

isIdentical('/pets/{petId}', '/pets/{name}'); // => true
isIdentical('/pets/{petId}', '/animals/{name}'); // => false
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

## License

`openapi-path-templating` is licensed under [Apache 2.0 license](https://github.com/swaggerexpert/openapi-path-templating/blob/main/LICENSE).
`openapi-path-templating` comes with an explicit [NOTICE](https://github.com/swaggerexpert/openapi-path-templating/blob/main/NOTICE) file
containing additional legal notices and information.
