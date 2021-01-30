// import { __getString, __newString, ByteArray } from '../es5';

const { __getString, __newString, ByteArray } = require('../es5');

const bytes = new ByteArray();
const world = 'ByteArray，你好！';

bytes.writeInt8(-128);
bytes.writeUint8(255);
bytes.writeUint16(Buffer.byteLength(world));
bytes.write(__newString(world));

bytes.offset = 0;

const int8 = bytes.readInt8();
const uint8 = bytes.readUint8();
const uint16 = bytes.readUint16();

console.log(int8, uint8, uint16, __getString(bytes.read(uint16)), __getString(bytes.toString()));
