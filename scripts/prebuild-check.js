import { statSync, existsSync } from 'fs';
import { resolve } from 'path';

const indexPath = resolve(process.cwd(), 'index.html');

console.log('🔍 Running prebuild checks...');

if (!existsSync(indexPath)) {
  console.error('❌ PREBUILD CHECK FAILED: index.html does not exist!');
  console.error('   Please create index.html as a file in the project root.');
  process.exit(1);
}

const stats = statSync(indexPath);

if (stats.isDirectory()) {
  console.error('❌ PREBUILD CHECK FAILED: index.html is a DIRECTORY, not a file!');
  console.error('   This will cause the Vite build to fail with EISDIR error.');
  console.error('   ');
  console.error('   To fix this:');
  console.error('   1. Delete the index.html directory');
  console.error('   2. Create index.html as a proper HTML file');
  process.exit(1);
}

if (!stats.isFile()) {
  console.error('❌ PREBUILD CHECK FAILED: index.html exists but is not a regular file!');
  console.error('   index.html must be a regular file, not a symlink, socket, or other special file type.');
  process.exit(1);
}

console.log('✅ Prebuild check passed: index.html is a valid file');
