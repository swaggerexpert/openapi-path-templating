import { assert } from 'chai';
import { Stats } from 'apg-lite';

import { parse } from '../../src/index.js';

describe('parse', function () {
  context('stats', function () {
    specify('should not produce stats by default', function () {
      const parseResult = parse('/pets/{petId}');

      assert.isUndefined(parseResult.stats);
    });

    specify('should produce stats when requested', function () {
      const parseResult = parse('/pets/{petId}', { stats: true });

      assert.instanceOf(parseResult.stats, Stats);
    });

    specify('should provide operator stats', function () {
      const parseResult = parse('/pets/{petId}', { stats: true });
      const expected =
        '          OPERATOR STATS\n' +
        '      |   MATCH |   EMPTY | NOMATCH |   TOTAL |\n' +
        '  ALT |      25 |       0 |      19 |      44 |\n' +
        '  CAT |       4 |       0 |       6 |      10 |\n' +
        '  REP |       8 |       0 |       3 |      11 |\n' +
        '  RNM |      23 |       0 |      29 |      52 |\n' +
        '  TRG |      14 |       0 |      20 |      34 |\n' +
        '  TBS |       0 |       0 |       2 |       2 |\n' +
        '  TLS |       6 |       0 |      74 |      80 |\n' +
        '  UDT |       0 |       0 |       0 |       0 |\n' +
        '  AND |       0 |       0 |       0 |       0 |\n' +
        '  NOT |       0 |       0 |       0 |       0 |\n' +
        'TOTAL |      80 |       0 |     153 |     233 |\n';

      assert.strictEqual(parseResult.stats.displayStats(), expected);
    });
  });
});
