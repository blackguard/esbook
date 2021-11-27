const fs_path = require('path');

const app_path = (...names) => fs_path.join(__dirname, ...names);

const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        main: [
            app_path('.', 'bundle.js'),
        ],
    },
    output: {
        path: app_path('..', 'build'),
        filename: 'esbook.js',
        publicPath: '/',
        chunkLoading: false,
        wasmLoading: false,
        workerChunkLoading: false,
        workerWasmLoading: false,
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                //extractComments: false,
            }),
        ],
    },
    performance: { hints: false },
};
