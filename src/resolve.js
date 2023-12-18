import parse from './parse/index.js';

const isEncoded = (value) => {
  try {
    return typeof value === 'string' && decodeURIComponent(value) !== value;
  } catch (e) {
    return false;
  }
};

const encodePathComponent = (component) => {
  if (isEncoded(component)) {
    return component;
  }

  return encodeURIComponent(component);
};

const significanTypes = [
  'slash',
  'path-literal',
  'query-marker',
  'query-literal',
  'template-expression-param-name',
];

const resolve = (pathTemplate, parameters = {}) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const parts = [];

  parseResult.ast.translate(parts);

  const resolvedParts = parts
    .filter(([type]) => significanTypes.includes(type))
    .map(([type, value]) => {
      if (type === 'template-expression-param-name') {
        return Object.hasOwn(parameters, value)
          ? encodePathComponent(parameters[value])
          : `{${value}}`;
      }

      return value;
    });

  return resolvedParts.join('');
};

export default resolve;
