import CSTTranslator from './CSTTranslator.js';

const transformPart = (node) => {
  if (node.type === 'path-literal') {
    return { type: 'PathLiteral', value: node.text };
  }

  const paramName = node.children.find(({ type }) => type === 'template-expression-param-name');
  return { type: 'TemplateExpression', name: paramName.text };
};

class ASTTranslator extends CSTTranslator {
  getTree() {
    const cst = super.getTree();
    const segments = cst.children
      .filter(({ type }) => type === 'path-segment')
      .map((segment) => ({ type: 'PathSegment', parts: segment.children.map(transformPart) }));
    const lastChild = cst.children[cst.children.length - 1];

    return {
      type: 'PathTemplate',
      segments,
      trailingSlash: segments.length > 0 && lastChild.type === 'slash',
    };
  }
}

export default ASTTranslator;
