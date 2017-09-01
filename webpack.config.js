const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {  
	entry: "./tests/app.tsx",
	output: {
		path: __dirname + "/tests/",
		filename: './bundle.js',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.d.ts']
	},
	module: {
		rules: [
			{
        test: /\.(ts|tsx)$/,
        use: 'awesome-typescript-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
		]
	},
  plugins: [
    new ExtractTextPlugin('style.css')
  ]
};
