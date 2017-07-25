'use strict';
var webpack = require('webpack');

module.exports = {

	entry: ['babel-polyfill', './src/test.js'],
	devtool: 'module-source-map',

	output: {
		pathinfo: true,
		filename: './dist/react-quill.js',
		library: 'ReactQuill',
		libraryTarget: 'umd'
	},

	module: {
		// Shut off warnings about using pre-built javascript files
		// as Quill.js unfortunately ships one as its `main`.
		noParse: /node_modules\/quill\/dist/,
		rules:[
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

	externals: {
		'react': {
			'commonjs': 'react',
			'commonjs2': 'react',
			'amd': 'react',
			'root': 'React'
		},
		'react-dom': {
			'commonjs': 'react-dom',
			'commonjs2': 'react-dom',
			'amd': 'react-dom',
			'root': 'ReactDOM'
		},
		'react-dom/server': {
			'commonjs': 'react-dom/server',
			'commonjs2': 'react-dom/server',
			'amd': 'react-dom/server',
			'root': 'ReactDOMServer'
		}
	}

};
