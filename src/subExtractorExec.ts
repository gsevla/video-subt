import { resolve } from 'node:path';
import { SubExtractor } from "./subExtractor";

const fileTarget = process.argv[2];
const outputPath = process.argv[3];

if(!fileTarget) {
    throw new Error('path not specified')
};

const absFileTarget = resolve(fileTarget);
console.log('### fileTarget: ' + absFileTarget);

const extractor = new SubExtractor();

extractor.execute(absFileTarget, outputPath);