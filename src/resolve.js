import parse from './parse/index.js';
import ListTranslator from './parse/translators/ListTranslator.js';

const isEncoded = (parameterValue) => {
  try {
    return (
      typeof parameterValue === 'string' && decodeURIComponent(parameterValue) !== parameterValue
    );
  } catch {
    return false;
  }
};

export const encodePathComponent = (parameterValue) => {
  if (isEncoded(parameterValue)) {
    return parameterValue;
  }

  return encodeURIComponent(parameterValue).replace(/%5B/g, '[').replace(/%5D/g, ']');
};

const significantTypes = ['slash', 'path-literal', 'template-expression-param-name'];

const resolve = (pathTemplate, parameters, options = {}) => {
  const defaultOptions = { encoder: encodePathComponent };
  const mergedOptions = { ...defaultOptions, ...options };
  const parseResult = parse(pathTemplate, { translator: new ListTranslator() });

  if (!parseResult.result.success) return pathTemplate;

  const parts = parseResult.tree;

  const resolvedParts = parts
    .filter(([type]) => significantTypes.includes(type))
    .map(([type, value]) => {
      if (type === 'template-expression-param-name') {
        return Object.prototype.hasOwnProperty.call(parameters, value)
          ? mergedOptions.encoder(parameters[value], value)
          : `{${value}}`;
      }

      return value;
    });

  return resolvedParts.join('');
};

export default resolve;
