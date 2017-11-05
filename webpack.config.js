var path = require('path');
var webpack = require('webpack');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var config = {
    entry: {
        popup: './src/popup/index.js',
        background: './src/background.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map',
    plugins: []
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new UglifyJSPlugin()
    )
}

module.exports = config;
