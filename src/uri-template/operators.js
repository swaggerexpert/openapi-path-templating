/**
 * Expansion behavior by operator.
 * https://datatracker.ietf.org/doc/html/rfc6570#appendix-A
 */
const OPERATORS = Object.freeze({
  '': { first: '', sep: ',', named: false, ifemp: '', allowReserved: false },
  '+': { first: '', sep: ',', named: false, ifemp: '', allowReserved: true },
  '.': { first: '.', sep: '.', named: false, ifemp: '', allowReserved: false },
  '/': { first: '/', sep: '/', named: false, ifemp: '', allowReserved: false },
  ';': { first: ';', sep: ';', named: true, ifemp: '', allowReserved: false },
  '?': { first: '?', sep: '&', named: true, ifemp: '=', allowReserved: false },
  '&': { first: '&', sep: '&', named: true, ifemp: '=', allowReserved: false },
  '#': { first: '#', sep: ',', named: false, ifemp: '', allowReserved: true },
});

export default OPERATORS;
