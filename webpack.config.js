var webpack = require('webpack');

module.exports = {
  entry: { utiles6: './utiles6.es6' },
  output: { filename: '[name].js',
            path: './dist'
          },
  externals: ['lodash-es'],
  plugins: [ new webpack.optimize.DedupePlugin() ],
  module: {
    loaders: [
      {
        test: /\.(es6|jsx|js)$/,
//        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};
