const fs = require('fs');
const path = require('path');

const runtimeEnv = {
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
};

const outputPath = path.join(__dirname, '..', 'public', 'runtime-env.js');
const fileContents = `window.__BLOGY_ENV__ = Object.freeze(${JSON.stringify(runtimeEnv, null, 2)});\n`;

fs.writeFileSync(outputPath, fileContents, 'utf8');

