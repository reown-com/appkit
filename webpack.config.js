const path = require("path");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: "production",
  entry: {
    index: "./src/index.ts"
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "Web3Connect",
    umdNamedDefine: true,
    globalObject: "this"
  },
  devtool: '',
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  externals : {
    '@walletconnect/web3-provider': '@walletconnect/web3-provider',
    '@portis/web3': '@portis/web3',
    'fortmatic': 'fortmatic',
    react: 'react',
    reactDOM: 'react-dom',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 65535,
              name: "static/media/[name].[hash:8].[ext]"
            }
          }
        ]
      }
    ]
  }
};
