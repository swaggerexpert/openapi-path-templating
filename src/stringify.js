const stringifyPart = (part) => (part.type === 'PathLiteral' ? part.value : `{${part.name}}`);

/**
 * Converts AST back into path template, optionally transforming its parts.
 */
const stringify = ({ segments, trailingSlash }, partToString = stringifyPart) =>
  `/${segments.map(({ parts }) => parts.map(partToString).join('')).join('/')}${trailingSlash ? '/' : ''}`;

export { stringifyPart };
export default stringify;
