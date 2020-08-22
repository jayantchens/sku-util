const path = require('path');
module.exports = {
	entry: path.join(__dirname, "src/index.js"),
	output: {
		libraryTarget: 'umd'
	},
	module: {
   		rules: [{
     		test: /\.js$/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: [
					    "@babel/plugin-proposal-class-properties",
					]
				}
			},
   			exclude: /node_modules/
 		}]
	},
	
}
