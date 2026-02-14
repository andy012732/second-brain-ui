# 🧠 Second Brain UI (Cloud Edition)

這是專為 **學長 (Andy)** 打造的個人知識庫系統。
它是一個「雙棲」應用程式：可以在本機讀寫檔案，也可以部署到雲端讀寫 GitHub 私有倉庫。

## 🚀 快速開始

### 1. 本機開發 (Local)
直接讀取電腦裡的 `notes/` 資料夾。

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 2. 雲端部署 (Vercel)
若要部署到 Vercel 並同步 GitHub 筆記，請設定以下環境變數：

| 環境變數 | 說明 | 範例 |
|----------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token (需有 Repo 權限) | `ghp_xxxx...` |
| `GITHUB_OWNER` | 你的 GitHub 帳號 | `andy012732` |
| `GITHUB_REPO` | 存放筆記的**私有倉庫**名稱 | `my-notes` |
| `GITHUB_BRANCH`| 分支名稱 (選填，預設 main) | `main` |

## 🛠️ 技術棧
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown + gray-matter
- **Sync**: Octokit (GitHub API)

## ✨ 特色
- **雙模式切換**：偵測到 `GITHUB_TOKEN` 自動切換為雲端模式，否則使用本機模式。
- **隱私優先**：筆記內容只存在你的 GitHub 私有倉庫，不經過第三方資料庫。
