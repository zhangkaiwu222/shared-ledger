# 一起算 · 家庭/情侣共同账本

面向国内 App Store 的共同记账 MVP：自动分摊、催款卡片、月报（Pro）。

已按 [《iOS应用开发完整指南：从零到App Store上架（2026版，含费用清单）》](https://blog.csdn.net/weixin_43726381/article/details/161879849) 做合规整改，细则见 [`store/APP_STORE_CHECKLIST.md`](./store/APP_STORE_CHECKLIST.md)。

## 当前技术路线

| 指南建议 | 本项目做法 |
|----------|------------|
| Mac + Xcode + SwiftUI | 业务用 **Expo / React Native**（指南亦认可跨平台）；上架规则相同 |
| Windows 不能跑 Xcode | 可在 Windows 开发；**iOS 正式包用 EAS 云构建或借用 Mac** |
| $99 开发者账号 | 上架前必须注册 |
| 隐私政策 / 支持 URL | 见 `docs/privacy`、`docs/support`，需托管为公网 HTTPS |
| 虚拟会员走 IAP | 产品 ID 已预留；Paywall 已按审核要素整改；正式 StoreKit 待接 |

## 功能

- 创建账本（2–3 人），无需注册登录
- 记一笔：金额 / 分类 / 付款人 / 均摊
- 清算：净额 + 最少转账路径
- 催款：复制文字 / 分享卡片（免费 2 次；Pro 无限 + 去水印）
- 报表：Pro 解锁分类占比与成员净额
- 本机持久化；生产包不展示「演示解锁」

## 本地运行

需要 Node.js 18+。

```bash
npm install
npx expo start
```

手机装 Expo Go 扫码；分享卡片建议真机。

## 上架最短路径（对照指南）

1. **托管合规页**：按 [`docs/GITHUB_PAGES.md`](./docs/GITHUB_PAGES.md) 发布到 GitHub Pages（一条命令替换 URL）  
2. **付费开发者账号**：$99/年  
3. **接入正式 IAP**（StoreKit / `expo-iap`），沙盒测订阅与「恢复购买」  
4. **EAS Build + Submit** → TestFlight → App Store Connect 填 [`store/metadata.zh-Hans.md`](./store/metadata.zh-Hans.md)  
5. **申请 Small Business Program**（年收入通常远低于门槛，佣金更低）  
6. 提交审核；对照清单避开隐私/IAP/元数据等拒因  

```bash
npm i -g eas-cli
eas login
eas build --platform ios --profile production
eas submit --platform ios
```

## 费用心里有数（摘自指南，2026）

- 开发者账号：约 ¥688/年  
- 审核本身：¥0  
- 隐私页：GitHub Pages 可 ¥0  
- 会员收入：中国区小型企业计划下约 **12%** 佣金（以苹果最新公告为准）  
- 若暂无 Mac：可用 EAS 云构建，不必先买整机（有 Mac 更利于真机调试与截图）

## 目录

```
app/                 # 页面（expo-router）
src/                 # 分摊逻辑、主题、状态
docs/privacy|support # 上架必填网页源文件
store/               # 元数据、整改清单、EAS 相关文案
eas.json             # 云构建 / 提交配置
```
