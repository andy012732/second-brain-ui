# 🚀 Vercel 部署指南

## 📋 前置準備
✅ GitHub Token 已設定  
✅ 私有筆記倉庫：`andy012732/my-notes`  
✅ 代碼已推送至：`andy012732/second-brain-ui`

---

## 🔧 部署步驟

### 1️⃣ 登入 Vercel
前往：https://vercel.com/login  
使用 **GitHub 帳號** 登入

### 2️⃣ 匯入專案
1. 點擊 **「Add New Project」**
2. 選擇 **「Import Git Repository」**
3. 找到 `andy012732/second-brain-ui`
4. 點擊 **「Import」**

### 3️⃣ 設定環境變數
在 **「Environment Variables」** 區塊，新增以下四個變數：

| Key | Value |
|-----|-------|
| `GITHUB_TOKEN` | `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (使用您的 GitHub Token) |
| `GITHUB_OWNER` | `andy012732` |
| `GITHUB_REPO` | `my-notes` |
| `GITHUB_BRANCH` | `main` |

⚠️ **重要**：環境變數套用範圍選擇：
- ✅ Production
- ✅ Preview
- ✅ Development

### 4️⃣ 部署設定
保持預設值：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

點擊 **「Deploy」** 開始部署！

---

## 🎉 部署完成後

### 取得網址
部署成功後，Vercel 會自動產生網址：
- **Production**: `https://second-brain-ui.vercel.app`
- **自訂網域**：可在 Settings > Domains 設定

### 測試功能
1. 打開部署網址
2. 側邊欄應該顯示 `my-notes` 倉庫的資料夾結構
3. 點擊任一 Markdown 檔案，確認能正常顯示

---

## 🔒 安全設定（可選）

### 選項 1：Vercel 密碼保護
1. 前往專案 **Settings > General**
2. 找到 **「Password Protection」**
3. 啟用並設定密碼

### 選項 2：環境變數密碼
在 `app/layout.tsx` 加入簡易驗證：
```typescript
const PASSWORD = process.env.ACCESS_PASSWORD;
if (!headers().get('authorization')?.includes(PASSWORD)) {
  return <div>請輸入密碼</div>;
}
```

---

## 🛠️ 故障排除

### 問題 1：無法讀取筆記
**原因**：GitHub Token 權限不足  
**解決**：確認 Token 有 `repo` 完整權限

### 問題 2：建置失敗
**檢查**：Vercel Deployment Logs  
**常見原因**：
- `npm install` 失敗 → 檢查 `package.json`
- TypeScript 編譯錯誤 → 修正後重新推送

### 問題 3：環境變數未生效
**解決**：重新部署
- 前往 **Deployments**
- 點最新部署右側的 **「⋯」**
- 選擇 **「Redeploy」**

---

## 📞 需要協助？
直接呼叫歐文 🫡
