/**
 *  Created by xiaolin on 2017-12-11.
 *	Copyright 2017 air. All rights reserved.
 */

'use strict'
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ISDEV = process.env.NODE_ENV === "development";
const buildPath = ISDEV ? "/cloud-home-dev" : "/cloud-home-prd";

const extractSass = new ExtractTextPlugin({
    filename: "css/app.css"
});

module.exports = {
    entry: [path.resolve(__dirname, "src/pages/app.tsx")],
    output: {
        path: path.resolve(__dirname, "build" + buildPath),
        filename: "js/app.js"
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.scss', 'css'],
        alias: {
            'mui': path.resolve(__dirname, 'src/public/js/mui.min.js'),
            'flexible': path.resolve(__dirname, 'src/public/js/flexible.min.js'),
            'layer': path.resolve(__dirname, 'src/public/js/layer_mobile/layer.js'),
            'pullToRefresh': path.resolve(__dirname, 'src/public/js/mui.pullToRefresh.js'),
            'city': path.resolve(__dirname, 'src/public/js/city.js')
        }
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [{ loader: 'url-loader', options: { limit: 10, publicPath: '../', name: 'images/[name].[ext]' } }]
            },
            {
                test: /\.(ttf|eot|woff|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: { publicPath: '../', name: 'icons/[name].[ext]' }
                }]
            },
            {
                test: /\.(scss)$/,
                use: extractSass.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader"
                    }],
                    fallback: "style-loader"
                })
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
                from: 'manifest.json',
                to: 'manifest.json'
            },
            {
                from: 'src/public/css',
                to: 'css'
            },
            {
                from: 'src/public/fonts',
                to: 'fonts'
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'html/index.html',
            minify: {
                collapseWhitespace: !ISDEV
            },
            template: path.resolve(__dirname, "index.html")
        }),
        extractSass
    ]
};