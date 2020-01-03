import * as webpack from 'webpack';
import {validate} from 'jsonschema';
import pad = require('pad');
/*const replace = require('replace-in-file');

replace.sync({
    files: 'src/meta.json',
    from: /{BUILD_TIMESTAMP}/g,
    to: new Date().toISOString(),
    allowEmptyPaths: true
});*/

const npmPackage = require('./package.json');
const metadata = require('./src/meta.json');
const metadataSchema = require('./meta.schema.json');

interface IMetadata {
    [key: string]: string | boolean | string[];
}

function generateHeader(metadata: IMetadata) {
    const validateResult = validate(metadata, metadataSchema);
    if (!validateResult.valid) {
        throw new Error(`The script metadata at ./src/meta.json is not valid.\n${validateResult}`);
    }

    const lines: string[] = [];
    const padLength = Math.max(...Object.keys(metadata).map(k => k.length));
    const makeLine = (key: string, value: string) => `// @${pad(key, padLength)} ${value}`;

    lines.push('// ==UserScript==');
    for (let key of Object.keys(metadata)) {
        if (key[0] === '$') continue;
        const value = metadata[key];
        if (Array.isArray(value)) {
            for (let subValue of value) {
                lines.push(makeLine(key, subValue));
            }
        } else if (typeof (value) === 'string') {
            lines.push(makeLine(key, value));
        } else if (typeof (value) === 'boolean' && value) {
            lines.push(makeLine(key, ''));
        }
    }
    lines.push('// ==/UserScript==\n');

    return lines.join('\n');
}


const config: webpack.Configuration = {
    entry: './src/index.tsx',
    output: {
        filename: `./dist/${npmPackage.name}.user.js`
    },
    // devtool: "source-map",
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            //{ test: /\.tsx?$/, use: 'ts-loader' },
            {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
            // { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {test: /\.css$/, use: ['style-loader', 'css-loader']}
        ]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: generateHeader(metadata),
            raw: true,
            entryOnly: true
        })
    ],
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};

export default config;