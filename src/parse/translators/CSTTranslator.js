import { Ast as AST } from 'apg-lite';

import cstCallback from '../callbacks/cst.js';

class CSTTranslator extends AST {
  constructor() {
    super();

    this.callbacks['path-template'] = cstCallback('path-template');
    this.callbacks['path-segment'] = cstCallback('path-segment');
    this.callbacks['slash'] = cstCallback('slash');
    this.callbacks['path-literal'] = cstCallback('path-literal');
    this.callbacks['template-expression'] = cstCallback('template-expression');
    this.callbacks['template-expression-param-name'] = cstCallback(
      'template-expression-param-name',
    );
  }

  getTree() {
    const data = { stack: [], root: null };
    this.translate(data);
    return data.root;
  }
}

export default CSTTranslator;
