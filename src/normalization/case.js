import parse from '../parse/index.js';
import stringify, { stringifyPart } from '../stringify.js';

/**
 * Implementation of https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.1
 */

const caseNormalizer = (pathTemplate) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  return stringify(parseResult.tree, (part) =>
    part.type === 'PathLiteral'
      ? part.value.replace(/%[0-9a-fA-F]{2}/g, (match) => match.toUpperCase())
      : stringifyPart(part),
  );
};

export default caseNormalizer;
