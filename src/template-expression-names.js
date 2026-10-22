/**
 * Names of template expressions in order of appearance in path template AST.
 */
const templateExpressionNames = (ast) =>
  ast.segments
    .flatMap(({ parts }) => parts)
    .filter(({ type }) => type === 'TemplateExpression')
    .map(({ name }) => name);

export const hasRepeatedNames = (names) => new Set(names).size !== names.length;

export default templateExpressionNames;
