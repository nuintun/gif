/**
 * @module NeuQuant
 */

const ncycles: i32 = 100; // number of learning cycles
const netsize: i32 = 256; // number of colors used
const maxnetpos: i32 = netsize - 1;

// defs for freq and bias
const netbiasshift: i32 = 4; // bias for colour values
const intbiasshift: i32 = 16; // bias for fractions
const intbias: i32 = 1 << intbiasshift;
const gammashift: i32 = 10;
const betashift: i32 = 10;
const beta: i32 = intbias >> betashift; /* beta = 1/1024 */
const betagamma: i32 = intbias << (gammashift - betashift);

// defs for decreasing radius factor
const initrad: i32 = netsize >> 3; // for 256 cols, radius starts
const radiusbiasshift: i32 = 6; // at 32.0 biased by 6 bits
const radiusbias: i32 = 1 << radiusbiasshift;
const initradius: i32 = initrad * radiusbias; //and decreases by a
const radiusdec: i32 = 30; // factor of 1/30 each cycle

// defs for decreasing alpha factor
const alphabiasshift: i32 = 10; // alpha starts at 1.0
const initalpha: i32 = 1 << alphabiasshift;

// radbias and alpharadbias used for radpower calculation
const radbiasshift: i32 = 8;
const radbias: i32 = 1 << radbiasshift;
const alpharadbshift: i32 = alphabiasshift + radbiasshift;
const alpharadbias: i32 = 1 << alpharadbshift;

// four primes near 500 - assume no image has a length so large that it is
// divisible by all four primes
const prime1: i32 = 499;
const prime2: i32 = 491;
const prime3: i32 = 487;
const prime4: i32 = 503;
const minpicturebytes: i32 = 3 * prime4;

function swapNetworkItem(x: Float64Array, y: Float64Array, index: i32): f64 {
  const item: f64 = x[index];

  x[index] = y[index];
  y[index] = item;

  return item;
}

/**
 * NeuQuant constructor
 * pixels - array of pixels in RGB format
 * samplefac - sampling factor 1 to 30 where lower is better quality
 */
export default class NeuQuant {
  private network: Float64Array[] = [];
  private netindex: Int32Array = new Int32Array(256);
  private freq: Int32Array = new Int32Array(netsize);
  private bias: Int32Array = new Int32Array(netsize);
  private radpower: Int32Array = new Int32Array(netsize >> 3);

  constructor(private pixels: i32[], private samplefac: i32) {
    for (let i: i32 = 0; i < netsize; i++) {
      const network = new Float64Array(4);

      network.fill((i << (netbiasshift + 8)) / netsize, 0, 3);

      this.bias[i] = 0;
      this.network[i] = network;
      this.freq[i] = intbias / netsize;
    }
  }

  // Unbiases network to give byte values 0..255 and record position i to prepare for sort
  unbiasnet(): void {
    for (let i: i32 = 0; i < netsize; i++) {
      const network: Float64Array = this.network[i];

      network[0] >>= netbiasshift;
      network[1] >>= netbiasshift;
      network[2] >>= netbiasshift;

      // Record color number
      network[3] = i;
    }
  }

  // Moves neuron *i* towards biased (r,g,b) by factor *alpha*
  altersingle(alpha: i32, i: u8, b: u8, g: u8, r: u8): void {
    const network: Float64Array = this.network[i];

    network[0] -= (alpha * (network[0] - b)) / initalpha;
    network[1] -= (alpha * (network[1] - g)) / initalpha;
    network[2] -= (alpha * (network[2] - r)) / initalpha;
  }

  // Moves neurons in *radius* around index *i* towards biased (r,g,b) by factor *alpha*
  alterneigh(radius: i32, i: u8, r: u8, g: u8, b: u8): void {
    let m: u16 = 1;
    let j: u16 = i + 1;
    let k: u16 = i - 1;

    const lo: i32 = Math.abs(i - radius);
    const hi: i32 = Math.min(i + radius, netsize);

    while (j < hi || k > lo) {
      const radpower: i32 = this.radpower[m++];

      if (j < hi) {
        const network: Float64Array = this.network[j++];

        network[0] -= (radpower * (network[0] - b)) / alpharadbias;
        network[1] -= (radpower * (network[1] - g)) / alpharadbias;
        network[2] -= (radpower * (network[2] - r)) / alpharadbias;
      }

      if (k > lo) {
        const network: Float64Array = this.network[k--];

        network[0] -= (radpower * (network[0] - b)) / alpharadbias;
        network[1] -= (radpower * (network[1] - g)) / alpharadbias;
        network[2] -= (radpower * (network[2] - r)) / alpharadbias;
      }
    }
  }

  // Searches for biased BGR values
  contest(r: u8, g: u8, b: u8): i32 {
    let bestd: i32 = ~(1 << 31);
    let bestbiasd: i32 = bestd;

    let bestpos: i32 = -1;
    let bestbiaspos: i32 = bestpos;

    for (let i: u16 = 0; i < netsize; i++) {
      const network = this.network[i];
      const dist: i32 = Math.abs(network[0] - b) + Math.abs(network[1] - g) + Math.abs(network[2] - r);

      if (dist < bestd) {
        bestd = dist;
        bestpos = i;
      }

      const biasdist: i32 = dist - (this.bias[i] >> (intbiasshift - netbiasshift));

      if (biasdist < bestbiasd) {
        bestbiasd = biasdist;
        bestbiaspos = i;
      }

      const betafreq = this.freq[i] >> betashift;

      this.freq[i] -= betafreq;
      this.bias[i] += betafreq << gammashift;
    }

    this.freq[bestpos] += beta;
    this.bias[bestpos] -= betagamma;

    return bestbiaspos;
  }

  // Sorts network and builds netindex[0..255]
  inxbuild(): void {
    let startpos: i32 = 0;
    let previouscol: i32 = 0;

    for (let i: i32 = 0; i < netsize; i++) {
      const network = this.network[i];

      let smallpos: i32 = i;
      // Index on g
      let smallval: f64 = network[1];

      // find smallest in i..netsize-1
      for (let j: i32 = i + 1; j < netsize; j++) {
        const network: Float64Array = this.network[j];

        if (network[1] < smallval) {
          // index on g
          smallpos = j;
          smallval = network[1]; // index on g
        }
      }

      const sNetwork: Float64Array = this.network[smallpos];

      // swap p (i) and q (smallpos) entries
      if (i != smallpos) {
        swapNetworkItem(network, sNetwork, 0);
        swapNetworkItem(network, sNetwork, 1);
        swapNetworkItem(network, sNetwork, 2);
        swapNetworkItem(network, sNetwork, 3);
      }
      // smallval entry is now in position i

      if (smallval != previouscol) {
        this.netindex[previouscol] = (startpos + i) >> 1;

        for (let j: i32 = previouscol + 1; j < smallval; j++) {
          this.netindex[j] = i;
        }

        startpos = i;
        previouscol = smallval;
      }
    }

    this.netindex[previouscol] = (startpos + maxnetpos) >> 1;

    for (let j: i32 = previouscol + 1; j < 256; j++) {
      // really 256
      this.netindex[j] = maxnetpos;
    }
  }

  // Main Learning Loop
  learn(): void {
    const alphadec = 30 + (this.samplefac - 1) / 3;

    const lengthcount: i32 = this.pixels.length;
    const samplepixels: i32 = lengthcount / (3 * this.samplefac);

    let alpha: i32 = initalpha;
    let radius: i32 = initradius;
    let rad: i32 = radius >> radiusbiasshift;
    let delta: i32 = (samplepixels / ncycles) | 0;

    if (rad <= 1) {
      rad = 0;
    }

    for (let i: i32 = 0; i < rad; i++) {
      this.radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
    }

    let step: i32;

    if (lengthcount < minpicturebytes) {
      step = 3;

      // Reset samplefac
      this.samplefac = 1;
    } else if (lengthcount % prime1 !== 0) {
      step = 3 * prime1;
    } else if (lengthcount % prime2 !== 0) {
      step = 3 * prime2;
    } else if (lengthcount % prime3 !== 0) {
      step = 3 * prime3;
    } else {
      step = 3 * prime4;
    }

    let i: i32 = 0;
    // current pixel
    let pix: i32 = 0;

    while (i < samplepixels) {
      const b: u8 = (this.pixels[pix] & 0xff) << netbiasshift;
      const g: u8 = (this.pixels[pix + 1] & 0xff) << netbiasshift;
      const r: u8 = (this.pixels[pix + 2] & 0xff) << netbiasshift;

      const j = this.contest(r, g, b);

      this.altersingle(alpha, j, b, g, r);

      if (rad !== 0) {
        // alter neighbours
        this.alterneigh(rad, j, r, g, b);
      }

      pix += step;

      if (pix >= lengthcount) {
        pix -= lengthcount;
      }

      if (delta === 0) {
        delta = 1;
      }

      if (++i % delta === 0) {
        alpha -= alpha / alphadec;
        radius -= radius / radiusdec;
        rad = radius >> radiusbiasshift;

        if (rad <= 1) {
          rad = 0;
        }

        for (let j: i32 = 0; j < rad; j++) {
          this.radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
        }
      }
    }
  }

  /**
   * 1. initializes network
   * 2. trains it
   * 3. removes misconceptions
   * 4. builds colorindex
   */
  buildColorMap(): StaticArray<u8> {
    this.learn();
    this.unbiasnet();
    this.inxbuild();

    const index: StaticArray<u8> = new StaticArray<u8>(netsize);
    const map: StaticArray<u8> = new StaticArray<u8>(netsize * 3);

    for (let i: i32 = 0; i < netsize; i++) {
      index[this.network[i][3]] = i;
    }

    let k: i32 = 0;

    for (var l = 0; l < netsize; l++) {
      const j: u8 = index[l];

      map[k++] = this.network[j][0] & 0xff;
      map[k++] = this.network[j][1] & 0xff;
      map[k++] = this.network[j][2] & 0xff;
    }

    return map;
  }
}
