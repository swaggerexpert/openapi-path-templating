// copyright: Copyright (c) 2024 Lowell D. Thomas, all rights reserved<br>
//   license: BSD-2-Clause (https://opensource.org/licenses/BSD-2-Clause)<br>
//
// Generated by apg-js, Version 4.4.0 [apg-js](https://github.com/ldthomas/apg-js)
export default function grammar(){
  // ```
  // SUMMARY
  //      rules = 13
  //       udts = 0
  //    opcodes = 65
  //        ---   ABNF original opcodes
  //        ALT = 7
  //        CAT = 4
  //        REP = 5
  //        RNM = 16
  //        TLS = 27
  //        TBS = 1
  //        TRG = 5
  //        ---   SABNF superset opcodes
  //        UDT = 0
  //        AND = 0
  //        NOT = 0
  // characters = [0 - 1114111]
  // ```
  /* OBJECT IDENTIFIER (for internal parser use) */
  this.grammarObject = 'grammarObject';

  /* RULES */
  this.rules = [];
  this.rules[0] = { name: 'path-template', lower: 'path-template', index: 0, isBkr: false };
  this.rules[1] = { name: 'path-segment', lower: 'path-segment', index: 1, isBkr: false };
  this.rules[2] = { name: 'slash', lower: 'slash', index: 2, isBkr: false };
  this.rules[3] = { name: 'path-literal', lower: 'path-literal', index: 3, isBkr: false };
  this.rules[4] = { name: 'template-expression', lower: 'template-expression', index: 4, isBkr: false };
  this.rules[5] = { name: 'template-expression-param-name', lower: 'template-expression-param-name', index: 5, isBkr: false };
  this.rules[6] = { name: 'pchar', lower: 'pchar', index: 6, isBkr: false };
  this.rules[7] = { name: 'unreserved', lower: 'unreserved', index: 7, isBkr: false };
  this.rules[8] = { name: 'pct-encoded', lower: 'pct-encoded', index: 8, isBkr: false };
  this.rules[9] = { name: 'sub-delims', lower: 'sub-delims', index: 9, isBkr: false };
  this.rules[10] = { name: 'ALPHA', lower: 'alpha', index: 10, isBkr: false };
  this.rules[11] = { name: 'DIGIT', lower: 'digit', index: 11, isBkr: false };
  this.rules[12] = { name: 'HEXDIG', lower: 'hexdig', index: 12, isBkr: false };

  /* UDTS */
  this.udts = [];

  /* OPCODES */
  /* path-template */
  this.rules[0].opcodes = [];
  this.rules[0].opcodes[0] = { type: 2, children: [1,2,6] };// CAT
  this.rules[0].opcodes[1] = { type: 4, index: 2 };// RNM(slash)
  this.rules[0].opcodes[2] = { type: 3, min: 0, max: Infinity };// REP
  this.rules[0].opcodes[3] = { type: 2, children: [4,5] };// CAT
  this.rules[0].opcodes[4] = { type: 4, index: 1 };// RNM(path-segment)
  this.rules[0].opcodes[5] = { type: 4, index: 2 };// RNM(slash)
  this.rules[0].opcodes[6] = { type: 3, min: 0, max: 1 };// REP
  this.rules[0].opcodes[7] = { type: 4, index: 1 };// RNM(path-segment)

  /* path-segment */
  this.rules[1].opcodes = [];
  this.rules[1].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
  this.rules[1].opcodes[1] = { type: 1, children: [2,3] };// ALT
  this.rules[1].opcodes[2] = { type: 4, index: 3 };// RNM(path-literal)
  this.rules[1].opcodes[3] = { type: 4, index: 4 };// RNM(template-expression)

  /* slash */
  this.rules[2].opcodes = [];
  this.rules[2].opcodes[0] = { type: 7, string: [47] };// TLS

  /* path-literal */
  this.rules[3].opcodes = [];
  this.rules[3].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
  this.rules[3].opcodes[1] = { type: 4, index: 6 };// RNM(pchar)

  /* template-expression */
  this.rules[4].opcodes = [];
  this.rules[4].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
  this.rules[4].opcodes[1] = { type: 7, string: [123] };// TLS
  this.rules[4].opcodes[2] = { type: 4, index: 5 };// RNM(template-expression-param-name)
  this.rules[4].opcodes[3] = { type: 7, string: [125] };// TLS

  /* template-expression-param-name */
  this.rules[5].opcodes = [];
  this.rules[5].opcodes[0] = { type: 3, min: 1, max: Infinity };// REP
  this.rules[5].opcodes[1] = { type: 1, children: [2,3,4] };// ALT
  this.rules[5].opcodes[2] = { type: 5, min: 0, max: 121 };// TRG
  this.rules[5].opcodes[3] = { type: 6, string: [124] };// TBS
  this.rules[5].opcodes[4] = { type: 5, min: 126, max: 1114111 };// TRG

  /* pchar */
  this.rules[6].opcodes = [];
  this.rules[6].opcodes[0] = { type: 1, children: [1,2,3,4,5] };// ALT
  this.rules[6].opcodes[1] = { type: 4, index: 7 };// RNM(unreserved)
  this.rules[6].opcodes[2] = { type: 4, index: 8 };// RNM(pct-encoded)
  this.rules[6].opcodes[3] = { type: 4, index: 9 };// RNM(sub-delims)
  this.rules[6].opcodes[4] = { type: 7, string: [58] };// TLS
  this.rules[6].opcodes[5] = { type: 7, string: [64] };// TLS

  /* unreserved */
  this.rules[7].opcodes = [];
  this.rules[7].opcodes[0] = { type: 1, children: [1,2,3,4,5,6] };// ALT
  this.rules[7].opcodes[1] = { type: 4, index: 10 };// RNM(ALPHA)
  this.rules[7].opcodes[2] = { type: 4, index: 11 };// RNM(DIGIT)
  this.rules[7].opcodes[3] = { type: 7, string: [45] };// TLS
  this.rules[7].opcodes[4] = { type: 7, string: [46] };// TLS
  this.rules[7].opcodes[5] = { type: 7, string: [95] };// TLS
  this.rules[7].opcodes[6] = { type: 7, string: [126] };// TLS

  /* pct-encoded */
  this.rules[8].opcodes = [];
  this.rules[8].opcodes[0] = { type: 2, children: [1,2,3] };// CAT
  this.rules[8].opcodes[1] = { type: 7, string: [37] };// TLS
  this.rules[8].opcodes[2] = { type: 4, index: 12 };// RNM(HEXDIG)
  this.rules[8].opcodes[3] = { type: 4, index: 12 };// RNM(HEXDIG)

  /* sub-delims */
  this.rules[9].opcodes = [];
  this.rules[9].opcodes[0] = { type: 1, children: [1,2,3,4,5,6,7,8,9,10,11] };// ALT
  this.rules[9].opcodes[1] = { type: 7, string: [33] };// TLS
  this.rules[9].opcodes[2] = { type: 7, string: [36] };// TLS
  this.rules[9].opcodes[3] = { type: 7, string: [38] };// TLS
  this.rules[9].opcodes[4] = { type: 7, string: [39] };// TLS
  this.rules[9].opcodes[5] = { type: 7, string: [40] };// TLS
  this.rules[9].opcodes[6] = { type: 7, string: [41] };// TLS
  this.rules[9].opcodes[7] = { type: 7, string: [42] };// TLS
  this.rules[9].opcodes[8] = { type: 7, string: [43] };// TLS
  this.rules[9].opcodes[9] = { type: 7, string: [44] };// TLS
  this.rules[9].opcodes[10] = { type: 7, string: [59] };// TLS
  this.rules[9].opcodes[11] = { type: 7, string: [61] };// TLS

  /* ALPHA */
  this.rules[10].opcodes = [];
  this.rules[10].opcodes[0] = { type: 1, children: [1,2] };// ALT
  this.rules[10].opcodes[1] = { type: 5, min: 65, max: 90 };// TRG
  this.rules[10].opcodes[2] = { type: 5, min: 97, max: 122 };// TRG

  /* DIGIT */
  this.rules[11].opcodes = [];
  this.rules[11].opcodes[0] = { type: 5, min: 48, max: 57 };// TRG

  /* HEXDIG */
  this.rules[12].opcodes = [];
  this.rules[12].opcodes[0] = { type: 1, children: [1,2,3,4,5,6,7] };// ALT
  this.rules[12].opcodes[1] = { type: 4, index: 11 };// RNM(DIGIT)
  this.rules[12].opcodes[2] = { type: 7, string: [97] };// TLS
  this.rules[12].opcodes[3] = { type: 7, string: [98] };// TLS
  this.rules[12].opcodes[4] = { type: 7, string: [99] };// TLS
  this.rules[12].opcodes[5] = { type: 7, string: [100] };// TLS
  this.rules[12].opcodes[6] = { type: 7, string: [101] };// TLS
  this.rules[12].opcodes[7] = { type: 7, string: [102] };// TLS

  // The `toString()` function will display the original grammar file(s) that produced these opcodes.
  this.toString = function toString(){
    let str = "";
    str += "; OpenAPI Path Templating ABNF syntax\n";
    str += "path-template                  = slash *( path-segment slash ) [ path-segment ]\n";
    str += "path-segment                   = 1*( path-literal / template-expression )\n";
    str += "slash                          = \"/\"\n";
    str += "path-literal                   = 1*pchar\n";
    str += "template-expression            = \"{\" template-expression-param-name \"}\"\n";
    str += "template-expression-param-name = 1*( %x00-79 / %x7C / %x7E-10FFFF ) ; every UTF8 character except { and } (from OpenAPI)\n";
    str += "\n";
    str += "; Characters definitions (from RFC 3986)\n";
    str += "pchar               = unreserved / pct-encoded / sub-delims / \":\" / \"@\"\n";
    str += "unreserved          = ALPHA / DIGIT / \"-\" / \".\" / \"_\" / \"~\"\n";
    str += "pct-encoded         = \"%\" HEXDIG HEXDIG\n";
    str += "sub-delims          = \"!\" / \"$\" / \"&\" / \"'\" / \"(\" / \")\"\n";
    str += "                    / \"*\" / \"+\" / \",\" / \";\" / \"=\"\n";
    str += "\n";
    str += "; Characters definitions (from RFC 5234)\n";
    str += "ALPHA               = %x41-5A / %x61-7A   ; A-Z / a-z\n";
    str += "DIGIT               = %x30-39            ; 0-9\n";
    str += "HEXDIG              = DIGIT / \"A\" / \"B\" / \"C\" / \"D\" / \"E\" / \"F\"\n";
    return str;
  }
}
