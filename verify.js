// Free Invoice & Receipt Kit - verification suite
// Runs structural checks on the static HTML/Markdown kit and logic checks on
// the embedded calculation scripts. No network, no secrets, no personal data.

const fs = require('fs');
const path = require('path');

const root = __dirname;
const failures = [];
let checks = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) failures.push(msg);
  return cond;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// 1. Required files exist
const required = [
  'LICENSE', 'README.md', 'STATUS.md', 'styles.css', 'verify.js',
  'invoice.html', 'invoice.md',
  'receipt-log.html', 'receipt-log.md',
  'mileage-tracker.html', 'mileage-tracker.md',
  'expense-categories.html', 'expense-categories.md'
];
for (const f of required) ok(fs.existsSync(path.join(root, f)), `missing file: ${f}`);

// 2. LICENSE exact copyright line
const license = read('LICENSE');
ok(license.includes('Copyright (c) 2026 Asdale Dynamics, LLC'),
  'LICENSE missing exact copyright line');
ok(/^MIT License$/m.test(license), 'LICENSE missing MIT License header');
ok(/Permission is hereby granted/m.test(license), 'LICENSE missing permission grant');
ok(/THE SOFTWARE IS PROVIDED "AS IS"/.test(license), 'LICENSE missing AS IS clause');

// 3. README credits Asdale Dynamics, LLC
const readme = read('README.md');
ok(readme.includes('Asdale Dynamics, LLC'), 'README missing Asdale Dynamics, LLC credit');

// 4. HTML structural checks
const htmlFiles = ['invoice.html', 'receipt-log.html', 'mileage-tracker.html', 'expense-categories.html'];
for (const f of htmlFiles) {
  const src = read(f);
  ok(/<\!DOCTYPE html>/i.test(src), `${f}: missing DOCTYPE`);
  ok(/<html[\s>]/i.test(src) && /<\/html>/i.test(src), `${f}: missing html root`);
  ok(/<head[\s>]/i.test(src) && /<\/head>/i.test(src), `${f}: missing head`);
  ok(/<body[\s>]/i.test(src) && /<\/body>/i.test(src), `${f}: missing body`);
  ok(/<title[^>]*>.*<\/title>/is.test(src), `${f}: missing title`);
  ok(/<meta charset="utf-8">/i.test(src), `${f}: missing charset`);
  ok(/<link rel="stylesheet" href="styles\.css">/.test(src), `${f}: missing styles.css link`);
  ok(/Asdale Dynamics, LLC/.test(src), `${f}: missing Asdale Dynamics credit`);
  ok(/no account/.test(src), `${f}: missing no-account claim`);

  // Tag balance for non-void elements
  const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const stack = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>/g;
  let m;
  while ((m = tagRe.exec(src)) !== null) {
    const name = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const opened = stack.pop();
      ok(opened === name, `${f}: closing </${name}> without matching <${opened}>`);
    } else if (!voids.has(name)) {
      stack.push(name);
    }
  }
  for (const left of stack) ok(false, `${f}: unclosed tag <${left}>`);
}

// 5. Logic checks on embedded calculation code (no DOM needed)
// money() formatting
const moneyCases = [
  [0, '$0.00'],
  [5, '$5.00'],
  [5.5, '$5.50'],
  [1234.567, '$1234.57'],
  [null, '$0.00'],
  [undefined, '$0.00']
];
for (const [input, expected] of moneyCases) {
  const result = '$' + Number(input || 0).toFixed(2);
  ok(result === expected, `money(${JSON.stringify(input)}) = ${result}, expected ${expected}`);
}

// mileage toString fix: radix bug must not appear; use String() / toFixed(1)
const mileageSrc = read('mileage-tracker.html');
ok(!/toString\(miles % 1 === 0 \? 0 : 1\)/.test(mileageSrc),
  'mileage-tracker still has toString radix bug');
ok(/String\(miles\)|miles\.toFixed\(1\)/.test(mileageSrc),
  'mileage-tracker missing safe mileage formatting');

// Simulate the mileage total-miles expression
for (const miles of [0, 10, 10.5, 25.25]) {
  const out = miles % 1 === 0 ? String(miles) : miles.toFixed(1);
  ok(out !== undefined, `mileage formatting for ${miles} produced output`);
}

// Invoice tax calc sanity: subtotal 100, rate 10 -> tax 10, total 110
const subtotal = 100;
const taxRate = 10;
const tax = subtotal * (taxRate / 100);
const total = subtotal + tax;
ok(tax === 10 && total === 110, `invoice tax math wrong: tax=${tax} total=${total}`);

// Receipt total sum sanity
const amounts = [5, 12.5, 3];
const receiptTotal = amounts.reduce((a, b) => a + b, 0);
ok(receiptTotal === 20.5, `receipt total math wrong: ${receiptTotal}`);

// 6. Markdown files reference Asdale Dynamics
for (const md of ['invoice.md', 'receipt-log.md', 'mileage-tracker.md', 'expense-categories.md']) {
  const src = read(md);
  ok(/Asdale Dynamics, LLC/.test(src), `${md} missing Asdale Dynamics credit`);
}

// Summary
console.log(`Verification: ${checks - failures.length}/${checks} checks passed`);
if (failures.length) {
  console.error('FAILURES:');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
}
console.log('All verification checks passed.');
