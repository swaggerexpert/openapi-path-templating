import parse from '../parse/index.js';

/**
 * Implementation of https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.3
 */

const significantTypes = ['slash', 'path-literal', 'template-expression'];

const pathSegmentNormalizer = (pathTemplate) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const parts = [];
  const stack = [];

  parseResult.ast.translate(parts);

  for (let i = 0; i < parts.length; i += 1) {
    let [type, value] = parts[i];

    // remove `template-expression-param-name` and treat `template-expression` as `path-literal`
    if (type === 'template-expression-param-name') {
      continue; // skip this segment
    }

    if (type === 'path-literal' || type === 'template-expression') {
      if (value === '.') continue; // ignore '.' segments

      if (value === '..') {
        // handle '..' segments
        if (stack.length > 1) {
          let last = stack.pop(); // remove preceding segment
          if (last[0] === 'slash' && stack.length > 0) {
            stack.pop(); // remove preceding slash if present
          }
        }
        continue; // move to the next segment
      }

      stack.push([type, value]); // push valid path-literals
    } else if (type === 'slash') {
      // only add slash if the last item on the stack is not a slash
      if (stack[stack.length - 1]?.[0] !== 'slash') {
        stack.push([type, value]);
      }
    } else {
      stack.push([type, value]); // preserve all other types
    }
  }

  const normalizedPathTemplate = stack.reduce((pathTemplateNormalized, [type, value]) => {
    if (significantTypes.includes(type)) {
      return `${pathTemplateNormalized}${value}`;
    }

    return pathTemplateNormalized;
  }, '');

  // makes sure the root path is represented as '/'
  return normalizedPathTemplate === '' ? '/' : normalizedPathTemplate;
};

export default pathSegmentNormalizer;
