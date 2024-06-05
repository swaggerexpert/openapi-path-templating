import parse from './parse/index.js';

const isEncoded = (component) => {
  try {
    return typeof component === 'string' && decodeURIComponent(component) !== component;
  } catch (e) {
    return false;
  }
};

export const encodePathComponent = (component) => {
  if (isEncoded(component)) {
    return component;
  }

  return encodeURIComponent(component).replace(/%5B/g, '[').replace(/%5D/g, ']');
};

const significantTypes = [
  'slash',
  'path-literal',
  'query-marker',
  'query-literal',
  'template-expression-param-name',
];

const resolve = (pathTemplate, parameters, options = {}) => {
  const defaultOptions = { encoder: encodePathComponent };
  const mergedOptions = { ...defaultOptions, ...options };
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const parts = [];

  parseResult.ast.translate(parts);

  const resolvedParts = parts
    .filter(([type]) => significantTypes.includes(type))
    .map(([type, value]) => {
      if (type === 'template-expression-param-name') {
        return Object.hasOwn(parameters, value)
          ? mergedOptions.encoder(parameters[value], value)
          : `{${value}}`;
      }

      return value;
    });

  return resolvedParts.join('');
};

export default resolve;
