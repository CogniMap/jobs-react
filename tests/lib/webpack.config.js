module.exports = {
    entry: "./app.tsx",
    output: {
        path: __dirname,
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
            }
        ]
    }
};
