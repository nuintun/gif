import * as fs from 'fs';
import { instantiateSync } from '@assemblyscript/loader';

export default instantiateSync(fs.readFileSync(__dirname + '/build/optimized.wasm'));
