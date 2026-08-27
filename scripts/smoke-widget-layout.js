/**
 * The Live Activity layout has to be self-contained.
 *
 * Babel serialises the body of a `'widget'`-directive function into a string, and the
 * widget extension evaluates that string in a runtime holding only the `@expo/ui`
 * primitives, the modifiers, a jsx stub and the JavaScript builtins. It does not have the
 * module the function was written in.
 *
 * So a reference to anything declared outside the function throws a `ReferenceError` on
 * device - and the card renders as an empty black rectangle, because the system draws
 * nothing when the layout produces no nodes. No error reaches the app, the logs or the
 * screen. Two colour constants at module scope cost an evening exactly that way.
 *
 * This transforms the layout the way Metro does, then checks every free identifier in the
 * serialised string against what the widget runtime actually provides.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@babel/core';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';

const traverse = _traverse.default ?? _traverse;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`  FAIL ${message}`);
};

/** Everything `expo-widgets/bundle/index.ts` puts on globalThis, plus the builtins. */
function widgetGlobals() {
  const names = new Set([
    // The jsx stub's exports.
    'jsx', 'jsxs', 'jsxDEV', 'jsxProd', '_jsx', '_jsxs', '_jsxDEV', 'Fragment', '_Fragment',
    '_jsxFileName',
    // The React stub.
    'React', 'Children',
    // JavaScript itself.
    'Object', 'Array', 'String', 'Number', 'Boolean', 'Math', 'JSON', 'Date', 'RegExp',
    'Map', 'Set', 'Error', 'Symbol', 'Promise', 'isNaN', 'parseInt', 'parseFloat',
    'undefined', 'globalThis', 'console',
  ]);

  // `expo-widgets/bundle/index.ts` does `Object.assign(globalThis, ...swiftUI, ...modifiers)`,
  // so every *export* is a global - not every file name. Several primitives share one
  // module: `Circle`, `Capsule` and `Rectangle` all live in `Shapes`. Reading the
  // declarations rather than the directory listing is the difference between trusting
  // this check and having it reject something that works.
  const base = path.join(root, 'node_modules/@expo/ui/build/swift-ui');
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith('.d.ts')) continue;
      const source = fs.readFileSync(full, 'utf8');
      for (const m of source.matchAll(/export declare (?:const|function) ([A-Za-z0-9_]+)/g)) {
        names.add(m[1]);
      }
    }
  };
  walk(base);
  return names;
}

const LAYOUTS = ['widgets/OrderActivity.tsx'];
const globals = widgetGlobals();

console.log('the layout is serialised at all');
for (const file of LAYOUTS) {
  const full = path.join(root, file);
  const out = babel.transformSync(fs.readFileSync(full, 'utf8'), {
    filename: full,
    presets: ['babel-preset-expo'],
    caller: { name: 'metro', platform: 'ios', isDev: false, supportsStaticESM: true },
    babelrc: false,
    configFile: false,
  });

  const match = /=\s*`(function\s*\([\s\S]*?)`;/.exec(out.code);
  if (!match) {
    fail(`${file}: the 'widget' directive was not serialised - is expo-widgets installed?`);
    continue;
  }
  console.log(`  ok   ${file}`);

  const source = match[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
  const ast = parse(`(${source})`, { sourceType: 'script', errorRecovery: false });

  console.log(`the layout closes over nothing (${file})`);
  const escaped = new Set();
  traverse(ast, {
    Identifier(nodePath) {
      if (!nodePath.isReferencedIdentifier()) return;
      const name = nodePath.node.name;
      if (nodePath.scope.hasBinding(name, { noGlobals: false })) return;
      if (globals.has(name)) return;
      escaped.add(name);
    },
  });

  // `<Image uiImage>` ignores `frame` and paints the asset across the whole card. The
  // white wordmark is a black field with a red mark, so putting it back means a giant sun
  // behind the copy - which shipped once. The mark is text.
  console.log(`the card draws no images (${file})`);
  if (/\bImage\b/.test(source)) {
    fail(`${file} renders an Image. Live Activity images fill the card; use text.`);
  } else {
    console.log('  ok   no Image in the serialised layout');
  }

  /**
   * Progress is green and amber; red belongs to a cancelled order.
   *
   * Brand red painted the track once, and it was wrong twice over: red on a *finished*
   * step reads as a fault, and `statusStyle` in `utils/theme.js` already spends red on
   * cancelled, failed and refunded everywhere else in the app.
   *
   * The values are the dark-surface variants. The app's cream-tuned green and amber drop
   * to roughly 4:1 on the Lock Screen's material and go muddy; these clear 10:1.
   */
  console.log(`progress is green and amber, red is for cancelled (${file})`);
  // Read the string literals rather than the text: Babel keeps comments in the serialised
  // layout, and a comment explaining why brand red is gone would otherwise fail the check
  // that brand red is gone.
  const literals = new Set();
  traverse(ast, {
    StringLiteral(nodePath) {
      literals.add(nodePath.node.value);
    },
  });

  const palette = [
    ['#30D158', 'green, for a step that is done'],
    ['#FF9F0A', 'amber, for the step in hand'],
    ['#FF453A', 'red, for a cancelled order'],
  ];
  for (const [hex, role] of palette) {
    if (literals.has(hex)) console.log(`  ok   ${hex} - ${role}`);
    else fail(`${file} no longer uses ${hex} (${role}).`);
  }
  if (literals.has('#dc2626')) {
    fail(
      `${file} paints with the brand red #dc2626.\n` +
        '    Red means cancelled in this app (utils/theme.js statusStyle); a finished\n' +
        '    step must not share it. Progress is green and amber.'
    );
  } else {
    console.log('  ok   brand red is not painted on the card');
  }

  if (escaped.size) {
    fail(
      `${file} references ${[...escaped].join(', ')}, which the widget runtime does not have.\n` +
        '    Anything the layout uses must be declared inside the function - the widget\n' +
        '    evaluates it as a standalone string and cannot see this module.'
    );
  } else {
    console.log('  ok   every identifier is a parameter, a local, or a widget global');
  }
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nwidget layout ok');
