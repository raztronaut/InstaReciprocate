const path = require('path');

module.exports = {
  entry: {
    content: path.resolve(__dirname, '../src/inject/script.ts'),
    background: path.resolve(__dirname, '../src/background/background.js')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist-extension'),
    clean: true
  }
}; 