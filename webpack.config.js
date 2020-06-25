const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    index: path.resolve(__dirname, "src", "index.ts")
  },
  output: {
    path: path.resolve(__dirname, "dist", "umd"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "Web3Modal",
    umdNamedDefine: true,
    globalObject: "this"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat"
    }
  },
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
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
