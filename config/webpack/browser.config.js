import path from 'node:path';
import { nonMinimizeTrait, minimizeTrait } from './traits.config.js';

const browser = {
  mode: 'production',
  entry: ['./src/index.js'],
  target: 'web',
  output: {
    path: path.resolve('./dist'),
    filename: 'openapi-path-templating.browser.js',
    libraryTarget: 'umd',
    library: 'OpenAPIPathTemplating',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
  ...nonMinimizeTrait,
};

const browserMin = {
  mode: 'production',
  entry: ['./src/index.js'],
  target: 'web',
  output: {
    path: path.resolve('./dist'),
    filename: 'openapi-path-templating.browser.min.js',
    libraryTarget: 'umd',
    library: 'OpenAPIPathTemplating',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
    ],
  },
  ...minimizeTrait,
};

export default [browser, browserMin];
