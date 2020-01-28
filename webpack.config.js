module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  entry: ['./src/index.js'],
  target: 'node',
  output: {
    path: `${process.cwd()}/dist`,
    filename: 'index.js',
  },
};
