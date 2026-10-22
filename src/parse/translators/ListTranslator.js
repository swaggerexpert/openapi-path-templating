import { Ast as AST } from 'apg-lite';

import listCallback from '../callbacks/list.js';

class ListTranslator extends AST {
  constructor() {
    super();

    this.callbacks['path-template'] = listCallback('path-template');
    this.callbacks['slash'] = listCallback('slash');
    this.callbacks['path-literal'] = listCallback('path-literal');
    this.callbacks['template-expression'] = listCallback('template-expression');
    this.callbacks['template-expression-param-name'] = listCallback(
      'template-expression-param-name',
    );
  }

  getTree() {
    const parts = [];
    this.translate(parts);
    return parts;
  }
}

export default ListTranslator;
