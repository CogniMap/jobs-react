const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./tests/app.tsx",
    output: {
        path: __dirname + "/tests/",
        filename: './bundle.js',
    },
    devtool: "source-map",
    mode: 'development',
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
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "style.css",
        })
    ]
};
