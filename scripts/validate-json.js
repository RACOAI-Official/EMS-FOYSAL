const fs = require('fs');
const path = require('path');

function walk(dir, files=[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'build') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.isFile() && e.name.endsWith('.json')) files.push(full);
  }
  return files;
}

const root = path.resolve(__dirname, '..');
const jsonFiles = walk(root);
let hadError = false;
for (const f of jsonFiles) {
  try {
    const raw = fs.readFileSync(f, 'utf8');
    JSON.parse(raw);
  } catch (err) {
    console.error('\nInvalid JSON in:', f);
    console.error(err.message);
    console.error('---- snippet ----');
    const raw = fs.readFileSync(f, 'utf8');
    console.error(raw.slice(0, 320));
    console.error('---- end ----\n');
    hadError = true;
  }
}
if (!hadError) console.log('All JSON files parsed successfully.');
process.exit(hadError?2:0);
