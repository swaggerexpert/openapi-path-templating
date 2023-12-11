# openapi-path-templating

[Path Templating](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#pathTemplating) allow defining values based on information that will only be available within the HTTP message in an actual API call.
This mechanism is used by [Paths Object](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#paths-object)
of [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification).

`openapi-path-templating` is a **parser**, **validator** and **resolver** for OpenAPI Path Templating. It supports
Path Templating defined in following OpenAPI specification versions:

- [OpenAPI 2.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#pathTemplating)
- [OpenAPI 3.0.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md#pathTemplating)
- [OpenAPI 3.0.1](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.1.md#pathTemplating)
- [OpenAPI 3.0.2](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.2.md#pathTemplating)
- [OpenAPI 3.0.3](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#pathTemplating)
- [OpenAPI 3.1.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#pathTemplating)

## Table of Contents

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Extraction](#extraction)
    - [Parsing](#parsing)
    - [Validation](#validation)
    - [Resolution](#resolution)
    - [Grammar](#grammar)
- [More about OpenAPI Path Templating](#more-about-openapi-path-templating)
- [License](#license)


## Getting started

### Installation

You can install `openapi-path-templating` using `npm`:

```sh
 $ npm install openapi-path-templating
```

Given that `openapi-path-templating` is a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
you can also install it directly from GitHub.

```sh
 $ npm install github:char0n/openapi-path-templating
```

### Usage

`openapi-path-templating` currently supports **parsing**, **validation** and **resolution**.
Both parser and validator are based on a superset of [ABNF](https://www.rfc-editor.org/rfc/rfc5234) ([SABNF](https://cs.github.com/ldthomas/apg-js2/blob/master/SABNF.md))
and use [apg-js](https://github.com/ldthomas/apg-js) parser generator.

#### Parsing

Parsing a Path template expression is as simple as importing the **parse** function
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
    length: 13,
    matched: 13,
    maxMatched: 13,
    maxTreeDepth: 15,
    nodeHits: 279,
    inputLength: 13,
    subBegin: 0,
    subEnd: 13,
    subLength: 13
  },
  ast: exportsAst {
    callbacks: [
      'path-template': [Function: pathTemplate],
      slash: [Function: slash],
      'path-literal': [Function: pathLiteral],
      'template-expression': [Function: templateExpression]
    ],
    astObject: 'astObject',
    init: [Function: init],
    ruleDefined: [Function: ruleDefined],
    udtDefined: [Function: udtDefined],
    down: [Function: down],
    up: [Function: up],
    translate: [Function: translate],
    setLength: [Function: setLength],
    getLength: [Function: getLength],
    toXml: [Function: toSml],
    phrases: [Function: phrases]
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
  [ 'template-expression', '{petId}' ]
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
<root nodes="5" characters="13">
  <!-- input string, decimal integer character codes -->
  47,112,101,116,115,47,123,112,101,116,73,100,125
  <node name="path-template" index="0" length="13">
    47,112,101,116,115,47,123,112,101,116,73,100,125
    <node name="slash" index="0" length="1">
      47
    </node><!-- name="slash" -->
    <node name="path-literal" index="1" length="4">
      112,101,116,115
    </node><!-- name="path-literal" -->
    <node name="slash" index="5" length="1">
      47
    </node><!-- name="slash" -->
    <node name="template-expression" index="6" length="7">
      123,112,101,116,73,100,125
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
test('/pets'); // => false
```

> [!IMPORTANT]
> Note that Relative URIs without path template expressions (like "/pets") always returns `false`.

#### Resolution

Resolving a Path Templating is as simple as importing the **resolve** function and calling it.

```js
import { resolve } from 'openapi-path-templating';

resolve('/pets/{petId}', { petId: 3 }); // => "/pets/3"
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
path-template       = slash *( ( path-literal / template-expression ) slash ) [ path-literal / template-expression ]
slash               = "/"
path-literal        = 1*( unreserved / pct-encoded / sub-delims-no-slash / ":" / "@" )
template-expression = "{" param-name "}"
param-name          = 1*( unreserved / pct-encoded / sub-delims-no-slash / ":" / "@" )

; Characters definitions (from RFC 3986)
unreserved          = ALPHA / DIGIT / "-" / "." / "_" / "~"
pct-encoded         = "%" HEXDIG HEXDIG
sub-delims-no-slash = "!" / "$" / "&" / "'" / "(" / ")"
                    / "*" / "+" / "," / ";"
ALPHA               = %x41-5A / %x61-7A   ; A-Z / a-z
DIGIT               = %x30-39            ; 0-9
HEXDIG              = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
```

## License

`openapi-path-templating` is licensed under [Apache 2.0 license](https://github.com/char0n/openapi-path-templating/blob/main/LICENSE).
`openapi-path-templating` comes with an explicit [NOTICE](https://github.com/char0n/openapi-path-templating/blob/main/NOTICE) file
containing additional legal notices and information.
