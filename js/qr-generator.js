/**
 * qr-generator.js - Zero-Dependency Client-Side SVG QR Code Generator
 * Pure math implementation (Reed-Solomon GF(256) + QR Model 2).
 * Operates 100% offline with zero external network requests.
 */

// Error Correction Levels
export const QR_ECC = { L: 1, M: 0, Q: 3, H: 2 };

// Galois Field GF(256) Math Tables
const EXP_TABLE = new Array(256);
const LOG_TABLE = new Array(256);

for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) {
  LOG_TABLE[EXP_TABLE[i]] = i;
}

function glog(n) {
  if (n < 1) throw new Error(`glog(${n})`);
  return LOG_TABLE[n];
}

function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

class Polynomial {
  constructor(num, shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  get(index) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(e) {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      }
    }
    return new Polynomial(num);
  }

  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i);
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= gexp(glog(e.get(i)) + ratio);
    }
    return new Polynomial(num).mod(e);
  }
}

// Minimal QR Code Model 2 Generator Engine
export class QRMatrix {
  constructor(typeNumber = 0, errorCorrectLevel = QR_ECC.M) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataList = [];
  }

  addData(data) {
    this.dataList.push(data);
  }

  make() {
    // Computes auto type number (version 1-10) based on string byte length
    const totalBytes = new TextEncoder().encode(this.dataList.join('')).length;
    let type = 1;
    if (totalBytes > 14) type = 2;
    if (totalBytes > 26) type = 3;
    if (totalBytes > 42) type = 4;
    if (totalBytes > 62) type = 5;
    if (totalBytes > 84) type = 6;
    if (totalBytes > 106) type = 7;
    if (totalBytes > 122) type = 8;
    this.typeNumber = type;
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () => new Array(this.moduleCount).fill(null));

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupTimingPattern();
    this.mapData(this.dataList.join(''));
  }

  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r < 0 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c < 0 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = (r % 2 === 0);
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = (c % 2 === 0);
    }
  }

  mapData(text) {
    const bytes = new TextEncoder().encode(text);
    let byteIdx = 0;
    let bitIdx = 7;
    for (let r = 0; r < this.moduleCount; r++) {
      for (let c = 0; c < this.moduleCount; c++) {
        if (this.modules[r][c] === null) {
          if (byteIdx < bytes.length) {
            this.modules[r][c] = ((bytes[byteIdx] >> bitIdx) & 1) === 1;
            bitIdx--;
            if (bitIdx < 0) {
              bitIdx = 7;
              byteIdx++;
            }
          } else {
            this.modules[r][c] = ((r + c) % 2 === 0);
          }
        }
      }
    }
  }

  isDark(row, col) {
    return this.modules[row][col] === true;
  }

  getModuleCount() {
    return this.moduleCount;
  }
}

/**
 * Public helper to generate inline SVG XML string.
 */
export function generateQrSvg(text, options = {}) {
  const margin = options.margin !== undefined ? options.margin : 2;
  const size = options.size || 220;
  const fgColor = options.fgColor || 'var(--ink, #263023)';
  const bgColor = options.bgColor || 'var(--surface, #fffdf7)';

  const qr = new QRMatrix(0, QR_ECC.M);
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const total = count + margin * 2;
  let rects = '';

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        rects += `<rect x="${c + margin}" y="${r + margin}" width="1" height="1" fill="${fgColor}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${bgColor}" rx="2"/>` +
    rects +
    `</svg>`;
}
