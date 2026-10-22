import { Parser, Stats } from 'apg-lite';

import Grammar from '../grammar.js';
import ASTTranslator from './translators/ASTTranslator.js';
import ListTranslator from './translators/ListTranslator.js';
import Trace from './trace/Trace.js';
import OpenAPIPathTemplatingParseError from '../errors/OpenAPIPathTemplatingParseError.js';

const grammar = new Grammar();

const parse = (
  pathTemplate,
  { translator = new ASTTranslator(), stats = false, trace = false } = {},
) => {
  if (typeof pathTemplate !== 'string') {
    throw new TypeError('Path template must be a string');
  }

  try {
    const parser = new Parser();

    if (translator) parser.ast = translator;
    if (stats) parser.stats = new Stats();
    if (trace) parser.trace = new Trace();

    const result = parser.parse(grammar, 'path-template', pathTemplate);
    let ast;

    return {
      result,
      tree: result.success && translator ? parser.ast.getTree() : undefined,
      stats: parser.stats,
      trace: parser.trace,
      /**
       * @deprecated retained for backward compatibility, use `tree` instead
       */
      get ast() {
        if (ast === undefined) {
          const listParser = new Parser();
          listParser.ast = new ListTranslator();
          listParser.parse(grammar, 'path-template', pathTemplate);
          ast = listParser.ast;
        }
        return ast;
      },
    };
  } catch (error) {
    throw new OpenAPIPathTemplatingParseError(
      'Unexpected error during OpenAPI Path Templating parsing',
      {
        cause: error,
        pathTemplate,
      },
    );
  }
};

export default parse;
