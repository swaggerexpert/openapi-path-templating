import { Parser, Stats } from 'apg-lite';

import Grammar from '../grammar.js';
import ListTranslator from './translators/ListTranslator.js';
import Trace from './trace/Trace.js';
import OpenAPIPathTemplatingParseError from '../errors/OpenAPIPathTemplatingParseError.js';

const grammar = new Grammar();

const parse = (
  pathTemplate,
  { translator = new ListTranslator(), stats = false, trace = false } = {},
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

    return {
      result,
      tree: result.success && translator ? parser.ast.getTree() : undefined,
      stats: parser.stats,
      trace: parser.trace,
      /**
       * @deprecated retained for backward compatibility, use `tree` instead
       */
      ast: parser.ast,
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
