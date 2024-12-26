const path = require('path');

module.exports = {
  entry: './src/inject/script.ts',
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
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    filename: 'instagram-analytics.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'InstagramAnalytics',
      type: 'var',
      export: 'default',
    },
    iife: true,
  },
  optimization: {
    minimize: true,
  },
}; 