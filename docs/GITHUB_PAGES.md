# 把隐私政策 / 支持页挂到 GitHub Pages

完成后会得到类似地址（把 `你的用户名` 换成真实的）：

- 隐私政策：`https://你的用户名.github.io/shared-ledger/privacy/`
- 技术支持：`https://你的用户名.github.io/shared-ledger/support/`

---

## 第一步：改项目里的 URL（本地）

在项目目录打开终端，执行（三处换成你的信息）：

```bash
node scripts/apply-site-urls.js 你的GitHub用户名 你的邮箱@xx.com shared-ledger
```

会自动改：

- `app.json` 里的 `privacyPolicyUrl` / `supportUrl`
- App 内链接 `src/constants/links.ts`
- `docs/privacy`、`docs/support` 里的联系邮箱

---

## 第二步：创建 GitHub 仓库并上传

1. 打开 https://github.com/new  
2. Repository name 填：`shared-ledger`（建议与脚本第三个参数一致）  
3. 选 **Public**（免费 Pages 对公共仓库最省事）  
4. 不要勾选 “Add a README”（本地已有文件）  
5. 点 Create repository  

本机若还没装 Git：先安装 [Git for Windows](https://git-scm.com/download/win)，安装后**新开一个终端**，再执行：

```bash
cd C:\Users\zhang\Desktop\App
git init
git add docs app.json src/constants/links.ts store scripts README.md
git commit -m "Add GitHub Pages privacy and support docs"
git branch -M main
git remote add origin https://github.com/你的用户名/shared-ledger.git
git push -u origin main
```

> 若希望整个 App 源码也上传，可 `git add .`（注意不要提交含密钥的文件；已有 `.gitignore`）。

---

## 第三步：打开 GitHub Pages

1. 打开仓库 → **Settings** → 左侧 **Pages**  
2. **Build and deployment** → Source 选 **Deploy from a branch**  
3. Branch 选 **main**，Folder 选 **/docs**  
4. 点 Save  

等 1–3 分钟，页面上方会出现：

`Your site is live at https://你的用户名.github.io/shared-ledger/`

用手机浏览器确认这两个能打开：

- `.../privacy/`
- `.../support/`

---

## 第四步：填到 App Store Connect

审核必填：

| 字段 | 填什么 |
|------|--------|
| Privacy Policy URL | `https://你的用户名.github.io/shared-ledger/privacy/` |
| Support URL | `https://你的用户名.github.io/shared-ledger/support/` |

App 内已从 `app.json` → `extra` 读取同一套地址，一般不用再改代码。

---

## 常见问题

**打开是 404？**  
- 等几分钟再刷新  
- 确认 Pages 的 Folder 是 **/docs**（不是 `/` 根目录）  
- 确认仓库名、用户名与脚本参数一致  

**想用自己的域名？**  
可在 Pages 里绑自定义域名；绑好后把 `apply-site-urls` 生成的地址改成你的域名即可。  

**仓库必须叫 shared-ledger 吗？**  
不必。若仓库叫别的名字，脚本第三个参数改成同名，例如：

```bash
node scripts/apply-site-urls.js zhangsan me@qq.com my-ledger-site
```
