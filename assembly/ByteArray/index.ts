/**
 * @module ByteArray
 */

import * as Hex from './Hex';
import * as Binary from './Binary';
import { ByteLength } from './enum';
import { calcBestLength, stringDecode, stringEncode } from './utils';

/**
 * @class ByteArray
 * @classdesc ByteArray 类提供用于优化读取、写入以及处理二进制数据的方法和属性
 * @classdesc 注意：ByteArray 类适用于需要在字节层访问数据的高级开发人员
 */
export default class ByteArray {
  // 缓冲区页大小
  // 容量不足时按页大小增长
  private _pageSize: u16;

  // 已使用字节偏移量
  // 即 ByteArray 字节长度
  private _length: i32 = 0;

  // 写入游标偏移
  private _offset: i32 = 0;

  // 初始化字节大小
  private _initLength: i32;

  // 数据字节
  private _bytes: Uint8Array;

  // 数据视图
  private _dataView: DataView;

  /**
   * @constructor
   * @param {u16} [pageSize] 缓冲分页大小，扩容时将按分页大小增加
   */
  constructor(length: i32 = 0, pageSize: u16 = 4096) {
    this._pageSize = pageSize;
    this._initLength = calcBestLength(length, pageSize);
    this._bytes = new Uint8Array(this._initLength);
    this._dataView = new DataView(this._bytes.buffer);
  }

  /**
   * @public
   * @static
   * @function from
   * @description 将 Uint8Array 转换为 ByteArray
   * @param {Uint8Array} bytes Uint8Array 数组
   * @param {i32} offset Uint8Array 数组复制偏移量
   * @param {i32} length Uint8Array 数组复制字节长度
   * @returns {ByteArray}
   */
  public static from(bytes: Uint8Array, offset: i32 = 0, length: i32 = -1): ByteArray {
    const buffer: ByteArray = new ByteArray();

    // 由于 bytes 不返回，所以实例化新的无意义
    if (bytes && offset >= 0) {
      if (length < 0) {
        length = bytes.length - offset;
      } else {
        length = <i32>Math.min(bytes.length - offset, length);
      }

      if (length > 0) {
        buffer.grow(length);
        buffer._bytes.set(bytes.subarray(offset, offset + length), buffer._offset);
        buffer.moveOffset(length);
      }
    }

    return buffer;
  }

  /**
   * @public
   * @property {i32} offset
   * @description 设置指针的当前位置。
   */
  public set offset(value: i32) {
    this._offset = <i32>Math.min(value, this._length);
  }

  /**
   * @public
   * @property {i32} offset
   * @description 获取指针的当前位置（以字节为单位）移动或返回到 ByteArray 对象中
   * 下一次调用读取方法时将在此位置开始读取，或者下一次调用写入方法时将在此位置开始写入
   * @returns {i32}
   */
  public get offset(): i32 {
    return this._offset;
  }

  /**
   * @public
   * @property {i32} length
   * @description 设置 ByteArray 已写入对象的长度（以字节为单位）
   * 如果将长度设置为大于当前长度的值，则用零填充字节数组的右侧
   * 如果将长度设置为小于当前长度的值，将会截断该字节数组
   */
  public set length(value: i32) {
    const length: i32 = value - this._length;

    if (length > 0) {
      this.grow(length);
    } else if (length < 0) {
      this._length = value;
    }

    if (this._offset > value) {
      this._offset = value;
    }
  }

  /**
   * @public
   * @property {i32} length
   * @description 获取 ByteArray 已写入对象的长度，以字节为单位
   * @returns {i32}
   */
  public get length(): i32 {
    return this._length;
  }

  /**
   * @public
   * @property {ArrayBuffer} buffer
   * @description 获取已写入长度的 ArrayBuffer 对象
   * @returns {ArrayBuffer}
   */
  public get buffer(): ArrayBuffer {
    return this._dataView.buffer.slice(0, this._length);
  }

  /**
   * @public
   * @property {Uint8Array} bytes
   * @description 获取已写入长度的 Uint8Array 字节对象
   * @returns {Uint8Array}
   */
  public get bytes(): Uint8Array {
    return this._bytes.subarray(0, this._length);
  }

  /**
   * @public
   * @property {i32} readAvailable
   * @description 获取可读的剩余字节数。
   * @returns {i32}
   */
  public get readAvailable(): i32 {
    return this._length - this._offset;
  }

  /**
   * @public
   * @property {i32} bytesAvailable
   * @description 可从字节数组的当前位置到数组末尾读取的数据的字节数
   * 每次访问 ByteArray 对象时，将 bytesAvailable 属性与读取方法结合使用，以确保读取有效的数据
   * @returns {i32}
   */
  public get bytesAvailable(): i32 {
    return this._dataView.byteLength - this._offset;
  }

  /**
   * @protected
   * @method grow
   * @description 扩充指定长度的缓冲区，如果缓冲区够用则不刷新缓冲区
   * @param {i32} length
   */
  protected grow(length: i32): void {
    length = <i32>Math.max(length + this._offset, this._length);

    if (this._dataView.byteLength < length) {
      const bytes: Uint8Array = new Uint8Array(calcBestLength(length, this._pageSize));

      bytes.set(this._bytes);

      this._bytes = bytes;
      this._length = length;
      this._dataView = new DataView(bytes.buffer);
    }
  }

  /**
   * @protected
   * @method moveOffset
   * @description 移动写入指针
   * @param {i32} offset
   */
  protected moveOffset(offset: i32): void {
    this._offset += offset;
  }

  /**
   * @public
   * @method clear
   * @description 清除字节数组的内容，并将 length 和 offset 属性重置为 0
   */
  public clear(): void {
    this._length = 0;
    this._offset = 0;
    this._bytes = new Uint8Array(this._initLength);
    this._dataView = new DataView(this._bytes.buffer);
  }

  /**
   * @static
   * @function copy
   * @description 从 ByteArray 数组复制数据
   * @param {ByteArray} bytes ByteArray 数组
   * @param {i32} offset ByteArray 数组复制偏移量
   * @param {i32} length ByteArray 数组复制字节长度
   */
  public copy(bytes: ByteArray, offset: i32 = 0, length: i32 = -1): void {
    // 由于 bytes 不返回，所以实例化新的无意义
    if (bytes && offset >= 0) {
      if (length < 0) {
        length = bytes.length - offset;
      } else {
        length = <i32>Math.min(bytes.length - offset, length);
      }

      if (length > 0) {
        this.grow(length);
        this._bytes.set(bytes._bytes.subarray(offset, offset + length), this._offset);
        this.moveOffset(length);
      }
    }
  }

  /**
   * @public
   * @method writeInt8
   * @description 在字节流中写入一个有符号字节
   * @param {i8} value 介于 -128 和 127 之间的整数
   */
  public writeInt8(value: i8): void {
    this.grow(ByteLength.INT8);
    this._dataView.setInt8(this._offset, value);
    this.moveOffset(ByteLength.INT8);
  }

  /**
   * @public
   * @method writeUint8
   * @description 在字节流中写入一个无符号字节
   * @param {u8} value 介于 0 和 255 之间的整数
   */
  public writeUint8(value: u8): void {
    this.grow(ByteLength.UINT8);
    this._dataView.setUint8(this._offset, value);
    this.moveOffset(ByteLength.UINT8);
  }

  /**
   * @method writeBoolean
   * @description 写入布尔值。根据 value 参数写入单个字节。如果为 true，则写入 1，如果为 false，则写入 0
   * @param {bool} value 确定写入哪个字节的布尔值。如果该参数为 true，则该方法写入 1；如果该参数为 false，则该方法写入 0
   */
  public writeBoolean(value: bool): void {
    this.writeUint8(value ? 1 : 0);
  }

  /**
   * @method writeInt16
   * @description 在字节流中写入一个 16 位有符号整数
   * @param {i16} value 要写入的 16 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt16(value: i16, littleEndian: bool = false): void {
    this.grow(ByteLength.INT16);
    this._dataView.setInt16(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.INT16);
  }

  /**
   * @method writeUint16
   * @description 在字节流中写入一个 16 位无符号整数
   * @param {u16} value 要写入的 16 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint16(value: u16, littleEndian: bool = false): void {
    this.grow(ByteLength.UINT16);
    this._dataView.setUint16(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.UINT16);
  }

  /**
   * @method writeInt32
   * @description 在字节流中写入一个有符号的 32 位有符号整数
   * @param {i32} value 要写入的 32 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt32(value: i32, littleEndian: bool = false): void {
    this.grow(ByteLength.INT32);
    this._dataView.setInt32(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.INT32);
  }

  /**
   * @method writeUint32
   * @description 在字节流中写入一个无符号的 32 位无符号整数
   * @param {u32} value 要写入的 32 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint32(value: u32, littleEndian: bool = false): void {
    this.grow(ByteLength.UINT32);
    this._dataView.setUint32(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.UINT32);
  }

  /**
   * @method writeInt64
   * @description 在字节流中写入一个无符号的 64 位有符号整数
   * @param {i64} value 要写入的 32 位有符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeInt64(value: i64, littleEndian: bool = false): void {
    this.grow(ByteLength.INI64);
    this._dataView.setInt64(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.INI64);
  }

  /**
   * @method writeUint64
   * @description 在字节流中写入一个无符号的 64 位无符号整数
   * @param {i64} value 要写入的 64 位无符号整数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeUint64(value: u64, littleEndian: bool = false): void {
    this.grow(ByteLength.UINT64);
    this._dataView.setUint64(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.UINT64);
  }

  /**
   * @method writeFloat32
   * @description 在字节流中写入一个 IEEE 754 单精度 32 位浮点数
   * @param {f32} value 单精度 32 位浮点数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeFloat32(value: f32, littleEndian: bool = false): void {
    this.grow(ByteLength.FLOAT32);
    this._dataView.setFloat32(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.FLOAT32);
  }

  /**
   * @method writeFloat64
   * @description 在字节流中写入一个 IEEE 754 双精度 64 位浮点数
   * @param {f64} value 双精度 64 位浮点数
   * @param {bool} [littleEndian] 是否为小端字节序
   */
  public writeFloat64(value: f64, littleEndian: bool = false): void {
    this.grow(ByteLength.FLOAT64);
    this._dataView.setFloat64(this._offset, value, <boolean>littleEndian);
    this.moveOffset(ByteLength.FLOAT64);
  }

  /**
   * @method write
   * @description 将字符串用指定编码写入字节流
   * @param {string} value 要写入的字符串
   * @param {string} [encoding] 字符串编码
   */
  public write(value: string, encoding: string = 'UTF8'): void {
    const utf8: ArrayBuffer = stringEncode(value, encoding);
    const bytes: Uint8Array = Uint8Array.wrap(utf8);

    this.grow(bytes.length);
    this._bytes.set(bytes, this._offset);
    this.moveOffset(bytes.length);
  }

  /**
   * @method readInt8
   * @description 从字节流中读取有符号的字节
   * @returns {i8} 介于 -128 和 127 之间的整数
   */
  public readInt8(): i8 {
    const value: i8 = this._dataView.getInt8(this._offset);

    this.moveOffset(ByteLength.INT8);

    return value;
  }

  /**
   * @method readUint8
   * @description 从字节流中读取无符号的字节
   * @returns {u8} 介于 0 和 255 之间的无符号整数
   */
  public readUint8(): u8 {
    const value: u8 = this._dataView.getUint8(this._offset);

    this.moveOffset(ByteLength.UINT8);

    return value;
  }

  /**
   * @method readBoolean
   * @description 从字节流中读取布尔值
   * @returns {bool} 读取单个字节，如果字节非零，则返回 true，否则返回 false
   */
  public readBoolean(): bool {
    return this.readUint8() as bool;
  }

  /**
   * @method readInt16
   * @description 从字节流中读取一个 16 位有符号整数
   * @returns {i16} 介于 -32768 和 32767 之间的 16 位有符号整数
   */
  public readInt16(littleEndian: bool = false): i16 {
    const value: i16 = this._dataView.getInt16(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.INT16);

    return value;
  }

  /**
   * @method readUint16
   * @description 从字节流中读取一个 16 位无符号整数
   * @returns {u16} 介于 0 和 65535 之间的 16 位无符号整数
   */
  public readUint16(littleEndian: bool = false): u16 {
    const value: u16 = this._dataView.getUint16(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.UINT16);

    return value;
  }

  /**
   * @method readInt32
   * @description 从字节流中读取一个 32 位有符号整数
   * @returns {i32} 介于 -2147483648 和 2147483647 之间的 32 位有符号整数
   */
  public readInt32(littleEndian: bool = false): i32 {
    const value: i32 = this._dataView.getInt32(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.INT32);

    return value;
  }

  /**
   * @method readUint32
   * @description 从字节流中读取一个 32 位无符号整数
   * @returns {u32} 介于 0 和 4294967295 之间的 32 位无符号整数
   */
  public readUint32(littleEndian: bool = false): u32 {
    const value: u32 = this._dataView.getUint32(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.UINT32);

    return value;
  }

  /**
   * @method readInt64
   * @description 从字节流中读取一个 64 位有符号整数
   * @returns {i64} 介于 -9223372036854775808 和 9223372036854775807 之间的 64 位有符号整数
   */
  public readInt64(littleEndian: bool = false): i64 {
    const value: i64 = this._dataView.getInt64(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.INI64);

    return value;
  }

  /**
   * @method readUint64
   * @description 从字节流中读取一个 64 位无符号整数
   * @returns {u64} 介于 0 和 18446744073709551615 之间的 64 位无符号整数
   */
  public readUint64(littleEndian: bool = false): u64 {
    const value: u64 = this._dataView.getUint64(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.UINT64);

    return value;
  }

  /**
   * @method readFloat32
   * @description 从字节流中读取一个 IEEE 754 单精度 32 位浮点数
   * @returns {f32} 单精度 32 位浮点数
   */
  public readFloat32(littleEndian: bool = false): f32 {
    const value: f32 = this._dataView.getFloat32(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.FLOAT32);

    return value;
  }

  /**
   * @method readFloat64
   * @description 从字节流中读取一个 IEEE 754 双精度 64 位浮点数
   * @returns {f64} 双精度 64 位浮点数
   */
  public readFloat64(littleEndian: bool = false): f64 {
    const value: f64 = this._dataView.getFloat64(this._offset, <boolean>littleEndian);

    this.moveOffset(ByteLength.FLOAT64);

    return value;
  }

  /**
   * @method read
   * @description 从字节流中读取一个字符串
   * @param {i32} length 读取的字节长度
   * @param {string} [encoding] 字符串编码
   * @returns {string} 指定编码的字符串
   */
  public read(length: i32, encoding: string = 'UTF8'): string {
    if (length > 0) {
      const end: i32 = this._offset + length;
      const buffer: ArrayBuffer = this._dataView.buffer;
      const utf8: ArrayBuffer = buffer.slice(this._offset, end);
      const value: string = stringDecode(utf8, encoding);

      this.moveOffset(length);

      return value;
    }

    return '';
  }

  /**
   * @method inspect
   * @description 检查 Buffer，返回 <Buffer 00 11 22 ... dd ee ff>
   * @param {i32} max 最大显示字节数，默认 32 字节
   * @returns {string}
   */
  public inspect(max: i32 = 32): string {
    // Hex 编码字符串
    let hex: string = '';

    // 提前获取 bytes，防止重复计算
    const bytes: Uint8Array = this.bytes;
    // 最大循环次数
    const count: i32 = Math.max(0, Math.min(max, bytes.length)) as i32;

    // 获取 Hex 编码
    for (let i: i32 = 0; i < count; i++) {
      const byte: u8 = bytes[i];

      hex += ' ' + Hex.mapping[byte];
    }

    if (bytes.length > max) {
      hex += ' ...';
    }

    // 返回 Hex 编码
    return '<Buffer' + hex + '>';
  }

  /**
   * @override
   * @method toString
   * @description 获取 Buffer 二进制编码字符串
   * @returns {string}
   */
  public toString(): string {
    // 二进制编码字符串
    let binary: string = '';

    // 提前获取 bytes，防止重复计算
    const bytes: Uint8Array = this.bytes;
    const length: i32 = bytes.length;

    // 获取二进制编码
    for (let i: i32 = 0; i < length; i++) {
      binary += Binary.mapping[bytes[i]];
    }

    // 返回二进制编码
    return binary;
  }
}
