import parse from '../parse/index.js';
import stringify from '../stringify.js';

/**
 * Implementation of https://datatracker.ietf.org/doc/html/rfc3986#section-6.2.2.3
 * Dot-segments are complete path segments consisting of `.` or `..` path literal.
 */

const dotSegment = ({ parts }) =>
  parts.length === 1 && parts[0].type === 'PathLiteral' && ['.', '..'].includes(parts[0].value)
    ? parts[0].value
    : null;

const pathSegmentNormalizer = (pathTemplate) => {
  const parseResult = parse(pathTemplate);

  if (!parseResult.result.success) return pathTemplate;

  const { segments, trailingSlash } = parseResult.tree;
  const output = [];
  // path ending with dot-segment ends with slash
  let endsWithSlash = trailingSlash;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;

    if (dotSegment(segment) === '.') {
      if (isLast) endsWithSlash = true;
    } else if (dotSegment(segment) === '..') {
      output.pop();
      if (isLast) endsWithSlash = true;
    } else {
      output.push(segment);
    }
  });

  return stringify({ segments: output, trailingSlash: endsWithSlash && output.length > 0 });
};

export default pathSegmentNormalizer;
