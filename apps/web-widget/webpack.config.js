const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'dysabot-widget.min.js' : 'dysabot-widget.js',
      library: 'DysaBotWidget',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'this',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: false,
        minify: isProduction,
      }),
      ...(isProduction ? [new MiniCssExtractPlugin({
        filename: 'dysabot-widget.min.css',
      })] : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: 7002,
      hot: true,
      open: true,
    },
    resolve: {
      extensions: ['.js'],
    },
  };
};