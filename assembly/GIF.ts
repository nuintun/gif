/**
 * @module GIF
 */

import ByteArray from './ByteArray';
import { assertBackground, assertPalette, assertRepeat } from './utils';

function calcColorDepth(palette: i32[]): i32 {
  let resolution: i32 = 0;
  let size: i32 = palette.length;

  while ((size >>= 1)) resolution++;

  return resolution;
}

export default class GIF {
  public readonly width: u16;
  public readonly height: u16;

  private _repeat: i32 = 0;
  private _buffer: ByteArray;
  private _background: i32 = 0;
  private _colorDepth: i32 = 0;
  private _palette: i32[] = [0x000000, 0xffffff];

  constructor(width: u16, height: u16) {
    this.width = width;
    this.height = height;
    this._buffer = new ByteArray(width * height * 9);
  }

  public set repeat(count: i32) {
    assertRepeat(count);

    this._repeat = count;
  }

  public get repeat(): i32 {
    return this._repeat;
  }

  public set palette(palette: i32[]) {
    assertPalette(palette);

    this._palette = palette;
    this._colorDepth = calcColorDepth(palette);
  }

  public get palette(): i32[] {
    return this._palette;
  }

  public set background(index: i32) {
    assertBackground(index, this._palette);

    this._background = index;
  }

  public get background(): i32 {
    return this._background;
  }

  private writeHeader() {
    this._buffer.write('GIF89a');
  }

  private writeLSD(): void {
    const buffer: ByteArray = this._buffer;

    // Logical screen size
    buffer.writeUint16(this.width, true);
    buffer.writeUint16(this.height, true);

    const useGCT: i32 = this._palette.length ? 0x80 : 0;
    const resolution: i32 = <i32>Math.max(0, this._colorDepth - 1);

    // Packed fields
    // 1: Global color table flag = 1 (gct used)
    // 2-4: Color resolution = 7
    // 5: GCT sort flag = 0
    // 6-8: GCT size
    buffer.writeUint8(useGCT | resolution | 0x00 | this.palette.length);

    // Background color index
    buffer.writeUint8(this._background);

    // Pixel aspect ratio - assume 1:1
    buffer.writeUint8(0);
  }

  private writeGCT(): void {
    const buffer: ByteArray = this._buffer;
    const palette: i32[] = this._palette;
    const length: i32 = palette.length;

    if (length) {
      for (let i: i32 = 0; i < length; i++) {
        const hex = palette[i];

        buffer.writeUint8((hex >> 16) & 0xff);
        buffer.writeUint8((hex >> 8) & 0xff);
        buffer.writeUint8(hex & 0xff);
      }
    }
  }

  private writeNetscapeExt(): void {
    const buffer: ByteArray = this._buffer;

    // Extension introducer
    buffer.writeUint8(0x21);
    // App extension label
    buffer.writeUint8(0xff);
    // Block size
    buffer.writeUint8(0x0b);
    // App id + auth code
    buffer.write('NETSCAPE2.0');
    // Sub-block size
    buffer.writeUint8(0x03);
    // Loop sub-block id
    buffer.writeUint8(0x01);
    // Loop count (extra iterations, 0=repeat forever)
    buffer.writeUint16(this._repeat, true);
    // Block terminator
    buffer.writeUint8(0x00);
  }

  // private writeGraphicCtrlExt() {
  //   const buffer: ByteArray = this._buffer;

  //   buffer.writeUint8(0x21); // extension introducer
  //   buffer.writeUint8(0xf9); // GCE label
  //   buffer.writeUint8(0x04); // data block size

  //   var transp, disp;
  //   if (this.transparent === null) {
  //     transp = 0;
  //     disp = 0; // dispose = no action
  //   } else {
  //     transp = 1;
  //     disp = 2; // force clear if using transparent color
  //   }

  //   if (this.dispose >= 0) {
  //     disp = this.dispose & 7; // user override
  //   }
  //   disp <<= 2;

  //   // packed fields
  //   this.out.writeByte(
  //     0 | // 1:3 reserved
  //       disp | // 4:6 disposal
  //       0 | // 7 user input - 0 = none
  //       transp // 8 transparency flag
  //   );

  //   this.writeShort(this.delay); // delay x 1/100 sec
  //   this.out.writeByte(this.transIndex); // transparent color index
  //   this.out.writeByte(0); // block terminator
  // }
}
