const path = require('path');
const yargs = require("yargs");
const env = yargs.argv.env; // use --env with webpack 2
const pkg = require("./package.json");
const shouldExportToAMD = yargs.argv.amd;

let libraryName = pkg.name;

let outputFile, mode;


if (env === "build") {
    mode = "production";
    outputFile = libraryName + ".min.js";
} else {
    mode = "development";
    outputFile = libraryName + ".js";
}

module.exports = {
    mode: mode,
    entry: path.resolve(__dirname, 'src/index.js'),
    devtool: 'source-map',
    externals: {
        react: 'react',
        'react-table': 'react-table',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: outputFile,
        library: {
            name: libraryName,
            type: 'umd',
        },
    },
};