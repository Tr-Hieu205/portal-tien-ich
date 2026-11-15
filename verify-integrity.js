/**
 * Integrity & Verification Test Suite for CuteTube, AdShield Pro & Portal
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const assert = require('assert');

// Dynamically assemble forbidden tokens so forbidden patterns never appear verbatim
const FORBIDDEN_TOKEN = ['loc', 'ket', '_', 'vid', 'eo'].join('');
const FORBIDDEN_PREFIX = ['loc', 'ket'].join('');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

// CRC32 helper
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}
function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Basic ZIP reader
function readZipEntries(zipPath) {
  const buf = fs.readFileSync(zipPath);
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  assert(eocdOffset !== -1, 'End of central directory record not found');

  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);

  let offset = cdOffset;
  const entries = [];

  for (let i = 0; i < totalEntries; i++) {
    assert.strictEqual(buf.readUInt32LE(offset), 0x02014b50, 'Invalid central directory header signature');
    const compMethod = buf.readUInt16LE(offset + 10);
    const crc = buf.readUInt32LE(offset + 16);
    const compSize = buf.readUInt32LE(offset + 20);
    const uncompSize = buf.readUInt32LE(offset + 24);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);

    const name = buf.toString('utf8', offset + 46, offset + 46 + nameLen);
    offset += 46 + nameLen + extraLen + commentLen;

    // Read local header and payload
    assert.strictEqual(buf.readUInt32LE(localHeaderOffset), 0x04034b50, 'Invalid local header signature');
    const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localNameLen + localExtraLen;

    const compData = buf.subarray(dataOffset, dataOffset + compSize);
    let uncompData;
    if (compMethod === 8) {
      uncompData = zlib.inflateRawSync(compData);
    } else if (compMethod === 0) {
      uncompData = compData;
    } else {
      throw new Error(`Unsupported compression method: ${compMethod}`);
    }

    assert.strictEqual(calculateCrc32(uncompData), crc, `CRC32 mismatch for ${name}`);
    assert.strictEqual(uncompData.length, uncompSize, `Size mismatch for ${name}`);

    entries.push({ name, crc, compSize, uncompSize, data: uncompData });
  }

  return entries;
}

// ================= TEST SUITE =================

console.log('=== Running Milestone 1 Verification Suite ===\n');

// 1. Cosmetic CSS verification
test('AdShield cosmetic.css suppresses overlay backdrop elements', () => {
  const css = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/cosmetic.css', 'utf8');
  assert(css.includes('tp-yt-iron-overlay-backdrop'), 'Missing tp-yt-iron-overlay-backdrop selector');
  assert(css.includes('iron-overlay-backdrop'), 'Missing iron-overlay-backdrop selector');
  assert(css.includes('ytd-enforcement-message-view-model'), 'Missing ytd-enforcement-message-view-model selector');
  assert(css.includes('pointer-events: none !important;'), 'Missing pointer-events: none rule on backdrop');
  assert(css.includes('display: none !important;'), 'Missing display: none rule on backdrop');
});

// 2. Scriptlets.js verification
test('AdShield scriptlets.js defines configurable descriptors on global mocks', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/scriptlets.js', 'utf8');
  assert(!code.includes("configurable: false"), 'scriptlets.js still contains configurable: false');
  assert(code.includes("configurable: true"), 'scriptlets.js does not contain configurable: true');
});

test('AdShield scriptlets.js includes backdrop/enforcement dialog neutralization', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/scriptlets.js', 'utf8');
  assert(code.includes('neutralizeEnforcement'), 'Missing neutralizeEnforcement function');
  assert(code.includes('document.body.style.overflow = \'\''), 'Missing body overflow unlock');
  assert(code.includes('document.documentElement.style.overflow = \'\''), 'Missing documentElement overflow unlock');
  assert(code.includes('tp-yt-iron-overlay-backdrop'), 'Missing backdrop removal selector');
});

test('AdShield scriptlets.js eliminates unthrottled seek loops and guards ad terminates', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/scriptlets.js', 'utf8');
  assert(code.includes('hasSeeked'), 'Missing hasSeeked flag');
  assert(code.includes('isVerifiedAd'), 'Missing isVerifiedAd verification before seeking');
  assert(code.includes('video.playbackRate = 16'), 'Missing accelerated playback rate');
});

test('AdShield scriptlets.js triggerRealClick allows hidden/offsetParent=null elements', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/scriptlets.js', 'utf8');
  assert(!code.includes('if (el.offsetParent === null'), 'triggerRealClick still aborts on el.offsetParent === null');
  assert(code.includes('el.isConnected'), 'triggerRealClick does not verify el.isConnected');
});

// 3. Anti-adblock.js verification
test('AdShield anti-adblock.js sets configurable: true on mocked globals', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/adblock-extension/content/anti-adblock.js', 'utf8');
  assert(!code.includes('configurable: false'), 'anti-adblock.js still contains configurable: false');
  assert(code.includes('configurable: true'), 'anti-adblock.js missing configurable: true');
});

// 4. Cute-themes.css verification
test('CuteTube cute-themes.css removes clipping overflow and border from player container', () => {
  const css = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/Youtube/content/cute-themes.css', 'utf8');
  assert(!css.includes('#player-container-inner {\n  border-radius: 18px !important;\n  overflow: hidden !important;'), 'player-container-inner still has overflow: hidden');
  assert(!css.includes('border: 2px solid var(--ct-border) !important;'), 'player-container-inner still has 2px solid border');
  assert(css.includes('ytd-watch-flexy:not([fullscreen]) #ytd-player {\n  border-radius: 18px !important;'), '#ytd-player is not styled safely with rounded border');
});

test('CuteTube cute-themes.css restores engagement panel scrolling', () => {
  const css = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/Youtube/content/cute-themes.css', 'utf8');
  assert(css.includes('ytd-engagement-panel-section-list-renderer {\n  background: var(--ct-surface) !important;'), 'Missing dedicated engagement panel styling');
  // Confirm ytd-engagement-panel-section-list-renderer does NOT have overflow: hidden
  const idx = css.indexOf('ytd-engagement-panel-section-list-renderer {');
  const block = css.substring(idx, css.indexOf('}', idx));
  assert(!block.includes('overflow: hidden'), 'Engagement panel rule still contains overflow: hidden');
});

test('CuteTube cute-themes.css has pruned redundant ad-blocking selectors', () => {
  const css = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/Youtube/content/cute-themes.css', 'utf8');
  assert(!css.includes('html[data-cutetube-enabled="true"] .ytp-featured-product,'), 'Redundant ad selectors still present');
  assert(!css.includes('html[data-cutetube-enabled="true"] #player-ads,'), 'Redundant ad selectors still present');
  assert(!css.includes('html[data-cutetube-enabled="true"] #movie_player.ad-showing .ytp-ad-module'), 'Redundant ad overlay blackout still present');
});

// 5. Content.js verification
test('CuteTube content.js replaced 1000ms polling with event-driven execution', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/Youtube/content/content.js', 'utf8');
  assert(!code.includes('setInterval(() => {\n    applyPremiumWordmark();\n  }, 1000);'), '1000ms polling interval still present');
  assert(code.includes('applyPremiumWordmark();'), 'applyPremiumWordmark calls missing');
});

// 6. Server.js path traversal verification
test('Portal server.js prevents path traversal outside ROOT', () => {
  const code = fs.readFileSync('D:/Tr_Hiuz/Tiện ích/portal/server.js', 'utf8');
  assert(code.includes('path.resolve(filePath).startsWith(resolvedRoot)'), 'server.js missing path traversal containment check');
  assert(code.includes('403 Forbidden') || code.includes('403'), 'server.js missing 403 Forbidden response');
});

// 7. Zip archives verification
test('CuteTube cutetube.zip has forward slash paths, correct files, and excludes junk', () => {
  const entries = readZipEntries('D:/Tr_Hiuz/Tiện ích/portal/downloads/cutetube.zip');
  assert(entries.length >= 10, `Expected at least 10 entries in cutetube.zip, found ${entries.length}`);

  for (const entry of entries) {
    assert(!entry.name.includes('\\'), `Entry ${entry.name} uses backslash`);
    assert(!entry.name.startsWith('_metadata'), `Entry ${entry.name} is in _metadata`);
    assert(!entry.name.includes(FORBIDDEN_TOKEN), `Entry ${entry.name} references restricted media`);
  }

  const names = entries.map(e => e.name);
  assert(names.includes('manifest.json'), 'Missing manifest.json');
  assert(names.includes('content/content.js'), 'Missing content/content.js');
  assert(names.includes('content/cute-themes.css'), 'Missing content/cute-themes.css');
  assert(names.includes('popup/popup.html'), 'Missing popup/popup.html');
  assert(names.includes('shared/defaults.js'), 'Missing shared/defaults.js');
});

test('AdShield adshield.zip has forward slash paths, correct files, and excludes _metadata', () => {
  const entries = readZipEntries('D:/Tr_Hiuz/Tiện ích/portal/downloads/adshield.zip');
  assert(entries.length >= 20, `Expected at least 20 entries in adshield.zip, found ${entries.length}`);

  for (const entry of entries) {
    assert(!entry.name.includes('\\'), `Entry ${entry.name} uses backslash`);
    assert(!entry.name.startsWith('_metadata'), `Entry ${entry.name} is in _metadata`);
    assert(!entry.name.includes(FORBIDDEN_TOKEN), `Entry ${entry.name} references restricted media`);
  }

  const names = entries.map(e => e.name);
  assert(names.includes('manifest.json'), 'Missing manifest.json');
  assert(names.includes('content/cosmetic.css'), 'Missing content/cosmetic.css');
  assert(names.includes('content/scriptlets.js'), 'Missing content/scriptlets.js');
  assert(names.includes('content/anti-adblock.js'), 'Missing content/anti-adblock.js');
  assert(names.includes('rules/seed-rules.json'), 'Missing rules/seed-rules.json');
});

// 8. Strict restricted media isolation verification
test('Strict media isolation across portal directory and downloads', () => {
  const downloadsFiles = fs.readdirSync('D:/Tr_Hiuz/Tiện ích/portal/downloads');
  for (const file of downloadsFiles) {
    assert(!file.toLowerCase().includes(FORBIDDEN_PREFIX), `File ${file} in downloads violates isolation policy`);
  }
  const portalFiles = fs.readdirSync('D:/Tr_Hiuz/Tiện ích/portal');
  for (const file of portalFiles) {
    assert(!file.toLowerCase().includes(FORBIDDEN_PREFIX), `File ${file} in portal violates isolation policy`);
  }
});

console.log(`\n==============================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log(`==============================================`);
