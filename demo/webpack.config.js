'use strict';
var webpack = require('webpack');

module.exports = {
	entry: './index.js',
	devtool: 'module-source-map',

	output: {
		filename: 'index.min.js'
	},
	module:{
		noParse: /dist\/react-quill/
		,rules:[
			{
				test:/\.js$/
				,use:[{
					loader:'babel-loader'
					,options:{
						"presets": [
						  "latest",
						  "react"
						],
						"plugins": [
						  "transform-object-rest-spread",
						  "babel-plugin-transform-class-properties"
						]
					}
				}]
			},
			{
				test:/\.css$/
				,use:['style-loader', 'css-loader']
			}
		]
	},
	plugins:[
		new webpack.ProvidePlugin({
			'window.Quill': 'QUILL'
		})
	]
};
