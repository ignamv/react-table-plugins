'use strict';

module.exports = {
  plugins: ['plugins/markdown'],
  source: {
    include: [
      'src/components.js',
      'src/hooks/index.js',
    ],
  },
  opts: {
    destination: './doc/build',
  },
};
