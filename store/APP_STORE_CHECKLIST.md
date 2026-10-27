# 一起算 · App Store 上架整改清单

对照 CSDN《[iOS应用开发完整指南：从零到App Store上架（2026版，含费用清单）](https://blog.csdn.net/weixin_43726381/article/details/161879849)》逐项落地。

## 技术路线说明（重要）

指南主推 **Mac + Xcode + SwiftUI**。本仓库当前为 **Expo（React Native）**，属于指南中的跨平台路线：

- 证书、TestFlight、审核、隐私、内购规则与原生**完全一样**
- 你在 **Windows** 上可继续用 AI 写业务代码；**打 iOS 正式包需 Mac 或 EAS 云构建**
- 若后续坚持纯原生，可再迁 SwiftUI；不必为了「整改」立刻重写，优先把合规与费用路径走通

## A. 环境与账号（指南一～三章）

- [ ] 准备 Mac（或 EAS Build 云 Mac）；本机 Windows **不能**跑 Xcode
- [ ] 安装 Xcode（若本地签名/Archive）+ Command Line Tools
- [ ] Apple ID 开启双重认证
- [ ] 注册 **Apple Developer Program**：$99/年（约 ¥688）— 上架必需
- [ ] 建议先免费账号 + 模拟器/Expo Go 验证功能，准备上架再付费
- [ ] Xcode / EAS 使用 **Automatically manage signing**
- [ ] Bundle ID 固定为 `com.zhangkaiwu222.sharedledger`（勿中途乱改）

## B. 开发与合规功能（指南四、十章）

- [x] 不强制注册登录即可用基本功能
- [x] 虚拟会员走 IAP 路径设计（产品 ID 已预留；正式 StoreKit 待接）
- [x] 演示解锁仅 `__DEV__` 可见，正式包不展示
- [x] Paywall 含：价格、时长、权益、自动续订说明、恢复购买、隐私/条款链接
- [x] 权限文案具体化（相册/保存催款卡用途）
- [x] `ITSAppUsesNonExemptEncryption = false`（未使用自定义加密）
- [ ] 接入正式 `expo-iap` / StoreKit 2，沙盒账号测订阅与恢复购买
- [ ] App 内**不要**做「检查更新」跳转外链更新包
- [ ] 截图与文案**不要**出现 Android 字样/设备

## C. 隐私与商店页（指南七章 — 最高频拒因）

- [x] 仓库内已提供隐私政策、支持页 HTML：`docs/privacy`、`docs/support`
- [ ] 用 GitHub Pages（或任意静态托管）发布为 **公网 HTTPS**
- [ ] 把真实 URL 写入 `app.json` → `extra.privacyPolicyUrl` / `supportUrl`
- [ ] 替换邮箱 `support@example.com`
- [ ] App Store Connect 填入隐私政策 URL、技术支持 URL
- [ ] App 隐私问卷：声明「仅设备本地存储财务相关数据」，无追踪则勿勾选跨 App 追踪

## D. 测试（指南五～六章）

- [ ] 真机测：记账、清算、分享、Paywall 链接可打开
- [ ] TestFlight 内部测试至少一轮（正式上架前强烈建议）
- [ ] 外部 TestFlight 可选（需短审）

## E. 打包上传（指南八～九章）

```bash
npm i -g eas-cli
eas login
eas build:configure   # 生成真实 projectId，替换 app.json extra.eas.projectId
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

- [ ] App Store Connect 创建 App，填完 `store/metadata.zh-Hans.md`
- [ ] 上传 6.7" + 5.5" 截图
- [ ] 创建订阅群组与两个自动续期商品
- [ ] 申请 [Small Business Program](https://developer.apple.com/cn/app-store/small-business-program/)（年收入 <$100万，佣金约 12%）
- [ ] 提交审核；被拒按 Resolution Center 改，可免费再提

## F. 费用速查（指南十一～十二章，2026）

| 项目 | 费用 |
|------|------|
| 开发者账号 | $99/年 |
| Mac（若买） | Mac Mini 起约数千元一次性 |
| 隐私页托管 | GitHub Pages ¥0 |
| 域名（可选） | 约 ¥50–100/年 |
| 审核本身 | ¥0 |
| 中国区佣金（小型企业） | 约 12%（以苹果最新公告为准） |
| 完全免费且无内购 | 佣金 0% |

## G. 高频拒因自检（指南第十章 TOP10）

1. 隐私政策可打开且写明本地数据范围  
2. 无崩溃、无空白页、无调试残留（生产包无演示解锁）  
3. 截图/描述与真实功能一致（勿写未做的云同步/Excel）  
4. 权限说明写清场景  
5. 不强制登录  
6. UI 完整可用，非网页套壳  
7. 若将来加登录，审核备注提供测试账号  
8. 元数据无 Android  
9. 会员必须 IAP，禁止引导微信/支付宝买虚拟会员  
10. 不做马甲包重复提交  

## 建议时间线（贴合本项目）

| 阶段 | 预估 |
|------|------|
| 功能打磨 + 隐私页上线 | 3–7 天 |
| 开发者账号激活 | 1–2 天 |
| StoreKit / EAS 接入 | 3–7 天 |
| TestFlight | 3–7 天 |
| 首次审核 | 1–5 天 |
| **合计** | 约 2–4 周（已有 MVP 时） |
