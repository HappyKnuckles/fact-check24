'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      sidepanel: PATHS.src + '/sidepanel.js',
      background: PATHS.src + '/background.js',
      offscreen: PATHS.src + '/offscreen.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
