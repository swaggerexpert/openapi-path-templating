import { Ast as AST, Parser, identifiers, utilities } from 'apg-lite';

import Grammar from '../path-templating.js';
import slashCallback from './callbacks/slash.js';
import pathTemplateCallback from './callbacks/path-template.js';
import pathLiteralCallback from './callbacks/path-literal.js';
import templateExpressionCallback from './callbacks/template-expression.js';
import templateExpressionParamNameCallback from './callbacks/template-expression-param-name.js';

const grammar = new Grammar();

const questionMark = (state, chars, phraseIndex, phraseLength, data) => {
  if (state === identifiers.SEM_PRE) {
    data.push(['question-mark', utilities.charsToString(chars, phraseIndex, phraseLength)]);
  } else if (state === identifiers.SEM_POST) {
    /* not used in this example */
  }
  return identifiers.SEM_OK;
};

const queryString = (state, chars, phraseIndex, phraseLength, data) => {
  if (state === identifiers.SEM_PRE) {
    data.push(['query-string', utilities.charsToString(chars, phraseIndex, phraseLength)]);
  } else if (state === identifiers.SEM_POST) {
    /* not used in this example */
  }
  return identifiers.SEM_OK;
};

const parse = (pathTemplate) => {
  const parser = new Parser();

  parser.ast = new AST();
  parser.ast.callbacks['path-template'] = pathTemplateCallback;
  parser.ast.callbacks['slash'] = slashCallback;
  parser.ast.callbacks['path-literal'] = pathLiteralCallback;
  parser.ast.callbacks['template-expression'] = templateExpressionCallback;
  parser.ast.callbacks['template-expression-param-name'] = templateExpressionParamNameCallback;
  parser.ast.callbacks['question-mark'] = questionMark;
  parser.ast.callbacks['query-string'] = queryString;

  const result = parser.parse(grammar, 'path-template', pathTemplate);

  return { result, ast: parser.ast };
};

export default parse;
