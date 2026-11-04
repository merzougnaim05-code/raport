/** compile.cjs — يهجَّر main.cjs إلى بايت-كود V8 (أحاؤه بنية العمل داخل نفس إصدار Electron). */
const path = require('path');
const bytenode = require('bytenode');

bytenode.compileFile({
  filename: path.resolve(__dirname, 'main.cjs'),
  output: path.resolve(__dirname, 'main.jsc'),
}).then(() => {
  console.log('COMPILED_OK');
  process.exit(0);
}).catch((e) => {
  console.error('COMPILE_FAIL', e);
  process.exit(1);
});
