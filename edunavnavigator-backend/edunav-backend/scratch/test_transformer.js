const path = require('path');
const onnxDir = path.join(__dirname, '../node_modules/@xenova/transformers/node_modules/onnxruntime-node/bin/napi-v3/win32/x64');
process.env.PATH = `${onnxDir};${process.env.PATH}`;

const { pipeline } = require('@xenova/transformers');

async function test() {
  try {
    console.log('Testing transformer with PATH updated...');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const out = await extractor('Does FAST Peshawar offer BS Computer Science?', { pooling: 'mean', normalize: true });
    console.log('Success! Vector length:', out.data.length);
  } catch (err) {
    console.error('Transformer error:', err);
  }
}

test();
