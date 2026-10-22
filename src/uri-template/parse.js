import { Ast as AST, Parser } from 'apg-lite';

import Grammar from './grammar.js';
import cstCallback from './cst.js';
import OpenAPIPathTemplatingParseError from '../errors/OpenAPIPathTemplatingParseError.js';

const grammar = new Grammar();

class CSTTranslator extends AST {
  constructor() {
    super();

    [
      'URI-Template',
      'literals',
      'expression',
      'operator',
      'varspec',
      'varname',
      'max-length',
      'explode',
    ].forEach((rule) => {
      this.callbacks[rule] = cstCallback(rule);
    });
  }

  getTree() {
    const data = { stack: [], root: null };
    this.translate(data);
    return data.root;
  }
}

const findChild = (node, type) => node.children.find((child) => child.type === type);

const toVariable = (varspec) => {
  const maxLength = findChild(varspec, 'max-length');

  return {
    name: findChild(varspec, 'varname').text,
    prefix: maxLength === undefined ? undefined : Number(maxLength.text),
    explode: findChild(varspec, 'explode') !== undefined,
  };
};

/**
 * Converts CST into AST: adjacent literal characters are merged into a single literal.
 */
const toAST = (cst) => {
  const parts = [];

  cst.children.forEach((node) => {
    const last = parts[parts.length - 1];

    if (node.type === 'literals') {
      if (last?.type === 'Literal') {
        last.value += node.text;
      } else {
        parts.push({ type: 'Literal', value: node.text });
      }
      return;
    }

    parts.push({
      type: 'Expression',
      operator: findChild(node, 'operator')?.text ?? '',
      variables: node.children.filter(({ type }) => type === 'varspec').map(toVariable),
    });
  });

  return { type: 'URITemplate', parts };
};

const parse = (uriTemplate) => {
  if (typeof uriTemplate !== 'string') {
    throw new TypeError('URI Template must be a string');
  }

  try {
    const parser = new Parser();
    parser.ast = new CSTTranslator();

    const result = parser.parse(grammar, 'URI-Template', uriTemplate);

    return { result, tree: result.success ? toAST(parser.ast.getTree()) : undefined };
  } catch (error) {
    throw new OpenAPIPathTemplatingParseError('Unexpected error during URI Template parsing', {
      cause: error,
      uriTemplate,
    });
  }
};

export default parse;
