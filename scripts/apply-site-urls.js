/**
 * 用法：
 *   node scripts/apply-site-urls.js <GitHub用户名> [联系邮箱] [仓库名]
 *
 * 示例：
 *   node scripts/apply-site-urls.js zhangsan support@gmail.com shared-ledger
 *
 * 生成的 HTTPS（仓库 Pages，Source = /docs）：
 *   https://zhangsan.github.io/shared-ledger/privacy/
 *   https://zhangsan.github.io/shared-ledger/support/
 */
const fs = require('fs');
const path = require('path');

const user = process.argv[2];
const email = process.argv[3] || 'support@example.com';
const repo = process.argv[4] || 'shared-ledger';

if (!user || user.includes('YOUR_') || user.includes('你的')) {
  console.error('请传入真实 GitHub 用户名，例如：');
  console.error('  node scripts/apply-site-urls.js yourname you@email.com');
  process.exit(1);
}

const base = `https://${user}.github.io/${repo}`;
const privacy = `${base}/privacy/`;
const support = `${base}/support/`;
const root = path.join(__dirname, '..');

function replaceInFile(rel, replacements) {
  const file = path.join(root, rel);
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }
  fs.writeFileSync(file, text);
  console.log('updated', rel);
}

const urlPairs = [
  ['https://YOUR_GITHUB_USER.github.io/shared-ledger/privacy/', privacy],
  ['https://YOUR_GITHUB_USER.github.io/shared-ledger/support/', support],
  [`https://${user}.github.io/shared-ledger/privacy/`, privacy],
  [`https://${user}.github.io/shared-ledger/support/`, support],
];

replaceInFile('app.json', [
  ...urlPairs,
  ['"owner": "your-expo-account"', `"owner": "${user}"`],
]);

replaceInFile('src/constants/links.ts', urlPairs);

replaceInFile('docs/privacy/index.html', [
  ['support@example.com（上架前请替换为你的真实邮箱）', email],
  ['support@example.com', email],
]);

replaceInFile('docs/support/index.html', [
  ['support@example.com（请替换为真实邮箱）', email],
  ['support@example.com', email],
]);

replaceInFile('store/metadata.zh-Hans.md', [
  ['`docs/support/index.html` 托管后的公网地址', support],
  ['`docs/privacy/index.html` 托管后的公网地址', privacy],
]);

console.log('\n完成。上线后请用浏览器打开：');
console.log(' ', privacy);
console.log(' ', support);
console.log('\n下一步：把仓库推到 GitHub，并在 Settings → Pages 选择 Branch: main，Folder: /docs');
