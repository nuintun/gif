/**
 * @module NeuQuant
 */

const ncycles = 100; // number of learning cycles
const netsize = 256; // number of colors used
const maxnetpos = netsize - 1;

// defs for freq and bias
const netbiasshift = 4; // bias for colour values
const intbiasshift = 16; // bias for fractions
const intbias = 1 << intbiasshift;
const gammashift = 10;
const gamma = 1 << gammashift;
const betashift = 10;
const beta = intbias >> betashift; /* beta = 1/1024 */
const betagamma = intbias << (gammashift - betashift);

// defs for decreasing radius factor
const initrad = netsize >> 3; // for 256 cols, radius starts
const radiusbiasshift = 6; // at 32.0 biased by 6 bits
const radiusbias = 1 << radiusbiasshift;
const initradius = initrad * radiusbias; //and decreases by a
const radiusdec = 30; // factor of 1/30 each cycle

// defs for decreasing alpha factor
const alphabiasshift = 10; // alpha starts at 1.0
const initalpha = 1 << alphabiasshift;

let alphadec; // biased by 10 bits

/* radbias and alpharadbias used for radpower calculation */
const radbiasshift = 8;
const radbias = 1 << radbiasshift;
const alpharadbshift = alphabiasshift + radbiasshift;
const alpharadbias = 1 << alpharadbshift;

// four primes near 500 - assume no image has a length so large that it is
// divisible by all four primes
const prime1 = 499;
const prime2 = 491;
const prime3 = 487;
const prime4 = 503;
const minpicturebytes = 3 * prime4;
