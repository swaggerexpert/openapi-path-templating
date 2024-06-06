import { Ast as AST, Parser } from '#apg-lite';

import Grammar from '../path-templating.js';
import slashCallback from './callbacks/slash.js';
import pathTemplateCallback from './callbacks/path-template.js';
import pathCallback from './callbacks/path.js';
import pathLiteralCallback from './callbacks/path-literal.js';
import queryCallback from './callbacks/query.js';
import queryMarkerCallback from './callbacks/query-marker.js';
import fragmentCallback from './callbacks/fragment.js';
import fragmentMarkerCallback from './callbacks/fragment-marker.js';
import templateExpressionCallback from './callbacks/template-expression.js';
import templateExpressionParamNameCallback from './callbacks/template-expression-param-name.js';

const grammar = new Grammar();

const parse = (pathTemplate) => {
  const parser = new Parser();

  parser.ast = new AST();
  parser.ast.callbacks['path-template'] = pathTemplateCallback;
  parser.ast.callbacks['path'] = pathCallback;
  parser.ast.callbacks['query'] = queryCallback;
  parser.ast.callbacks['query-marker'] = queryMarkerCallback;
  parser.ast.callbacks['fragment'] = fragmentCallback;
  parser.ast.callbacks['fragment-marker'] = fragmentMarkerCallback;
  parser.ast.callbacks['slash'] = slashCallback;
  parser.ast.callbacks['path-literal'] = pathLiteralCallback;
  parser.ast.callbacks['template-expression'] = templateExpressionCallback;
  parser.ast.callbacks['template-expression-param-name'] = templateExpressionParamNameCallback;

  const result = parser.parse(grammar, 'path-template', pathTemplate);

  return { result, ast: parser.ast };
};

export default parse;
