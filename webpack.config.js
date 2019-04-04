const path = require("path");
const pkg = require("./package.json");

module.exports = {
  mode: "production",
  entry: {
    index: "./src/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: pkg.name,
    umdNamedDefine: true,
    globalObject: "this"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: "source-map",
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  }
};
