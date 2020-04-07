const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'output'),
    },
    resolve: {
        alias: {
            assets: path.resolve(__dirname, 'src/assets/'),
            components: path.resolve(__dirname, 'src/components/'),
            data: path.resolve(__dirname, 'src/data/'),
            dataExtenders: path.resolve(__dirname, 'src/dataExtenders/'),
            global$: path.resolve(__dirname, 'src/global.js'),
            history$: path.resolve(__dirname, 'src/history.js'),
            modules: path.resolve(__dirname, 'src/modules/'),
            stores: path.resolve(__dirname, 'src/stores/'),
            styles: path.resolve(__dirname, 'src/styles/'),
            utils$: path.resolve(__dirname, 'src/utils.js'),
            attribution: path.resolve(__dirname, 'src/attribution/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader/useable' },
                    {
                        loader: 'css-loader',
                        options: {
                            camelCase: true,
                            importLoaders: 1,
                            localIdentName: '[name]__[local]-[hash:base64:3]',
                            modules: true,
                        },
                    },
                    { loader: 'postcss-loader' },
                ],
                exclude: /(node_modules|global)/,
            },
            {
                test: /([\s\S]*?)node_modules([\s\S]+?)\.css$/,
                use: [
                    { loader: 'style-loader/useable' },
                    { loader: 'css-loader' },
                ],
            },
            {
                test: /([\s\S]*?)global([\s\S]+?)\.css$/,
                use: [
                    { loader: 'style-loader/useable' },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader' },
                ],
            },
            {
                test: /\.(png|jpg|gif|svg|ttf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            inject: false,
            minify: false,
            hash: true,
        }),
        new CopyPlugin([
            { from: 'src/icons', to: 'icons' },
            { from: 'src/assets', to: 'assets' },
            { from: 'src/googleapi', to: 'googleapi' },
            { from: 'src/icons/favicon.ico', to: 'favicon.ico' },
            {
                from: 'src/icons/apple-touch-icon.png',
                to: 'apple-touch-icon.png',
            },
        ]),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'output'),
        compress: true,
        port: 7272,
        historyApiFallback: true,
        inline: true,
    },
};
