const path = require("path");
const externalReact = require('webpack-external-react');

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
  externals : {
    ...externalReact.externals,
    'fortmatic': 'fortmatic',
    'squarelink': 'squarelink',
    '@portis/web3': '@portis/web3',
    'styled-components': 'styled-components',
    '@walletconnect/web3-provider': '@walletconnect/web3-provider',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    noParse: externalReact.noParse,
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
