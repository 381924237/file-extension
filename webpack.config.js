const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const config = {
  performance: {
    hints: false
  },
  target: 'web',
  entry: path.resolve(__dirname, './src/webview/index.tsx'),
  output: {
    filename: 'webview.js',
    path: path.resolve(__dirname, './out')
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          sourceType: 'unambiguous',
          presets: ['@babel/preset-env', 'solid', '@babel/preset-typescript']
        }
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'webview.css'
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  devServer: {
    port: 7777,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}

module.exports = (env) => {
  config.mode = env.prod ? 'production' : 'development'
  return config
}
