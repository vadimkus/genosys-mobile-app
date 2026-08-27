/**
 * The Live Activity layout has to be self-contained.
 *
 * Babel serialises the body of a `'widget'`-directive function into a string, and the
 * widget extension evaluates that string in a runtime holding only the `@expo/ui`
 * primitives, the modifiers, a jsx stub and the JavaScript builtins. It does not have the
 * module the function was written in.
 *
 * So a reference to anything declared outside the function throws a `ReferenceError` on
 * device — and the card renders as an empty black rectangle, because the system draws
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

  for (const dir of ['swift-ui', 'swift-ui/modifiers']) {
    const base = path.join(root, 'node_modules/@expo/ui/build', dir);
    const index = path.join(base, 'index.d.ts');
    if (!fs.existsSync(index)) continue;
    // Every primitive is a folder or file next to the index; every modifier likewise.
    for (const entry of fs.readdirSync(base)) {
      if (entry.startsWith('index') || entry.endsWith('.map')) continue;
      names.add(entry.replace(/\.d\.ts$/, ''));
    }
    // The modifier index re-exports names that are not file names of their own.
    const source = fs.readFileSync(index, 'utf8');
    for (const m of source.matchAll(/export declare (?:const|function) ([A-Za-z0-9_]+)/g)) {
      names.add(m[1]);
    }
  }
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
