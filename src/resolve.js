import test from './test.js'
import parse from './parse/index.js';

const isEncoded = (value) => {
  try {
    return typeof value === 'string' && decodeURIComponent(value) !== value;
  } catch (e) {
    return false;
  }
}

const encodePathComponent = (component) => {
  if (isEncoded(component)) {
    return component;
  }

  return encodeURIComponent(component)
}

const resolve = (pathTemplate, parameters = {}) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const parts = [];
  parseResult.ast.translate(parts);
  const resolvedPats = parts
    .filter(([type]) => ['slash', 'path-literal', 'template-expression'].includes(type))
    .map(([type, value]) => {
      if (type === 'template-expression') {
        const parameterName = value.slice(1, -1); // remove braces

        return Object.hasOwn(parameters, parameterName)
          ? encodePathComponent(parameters[parameterName])
          : value;
      }

      return value;
    });

  return resolvedPats.join('');
};

export default resolve;
