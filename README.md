# 勤怠管理

個人用勤怠管理PWAアプリ（React 18 + TypeScript + Vite + Tailwind CSS）

## 機能概要

- 月別カレンダー表示（土日祝の色分け）
- 出勤記録（出社/直行/直帰/出張/在宅）
- 出退勤時刻・実働時間・残業時間の管理
- 月次サマリー（出勤日数・総実働時間・残業時間）
- PWA対応（iPhoneホーム画面に追加可能・オフライン動作）
- localStorage によるデータ保存（サーバー不要）

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| UI | React 18 + TypeScript |
| スタイル | Tailwind CSS v4 |
| ビルド | Vite 8 |
| PWA | vite-plugin-pwa |
| 祝日 | japanese-holidays |
| データ | localStorage |
| ホスティング | GitHub Pages |

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build   # dist/ に出力
```

GitHub Actions で `main` ブランチへのプッシュ時に自動デプロイ。

## iPhoneホーム画面への追加

1. iPhoneのSafariでアプリのURLを開く
2. 画面下部の「共有」ボタンをタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

## 実装フェーズ（Section 7）

| Step | 内容 | 状態 |
|------|------|------|
| 1 | プロジェクト初期化（Vite + React + TS + Tailwind + PWA） | ✅ 完了 |
| 2 | カレンダーUI（月別グリッド・土日祝色分け・月移動） | 未着手 |
| 3 | 勤怠入力モーダル（出退勤時刻・区分・備考・localStorage保存） | 未着手 |
| 4 | 月次サマリー（出勤日数・総実働時間・残業時間） | 未着手 |
| 5 | PWA化（manifest・Service Worker・アイコン・オフライン） | 未着手 |
| 6 | GitHub Pages公開（GitHub Actions自動デプロイ） | 未着手 |
| 7 | 有給管理（付与日数・取得記録・残日数カウント） | 未着手 |
| 8 | CSVエクスポート（UTF-8 BOM付き） | 未着手 |
| 9 | 通知（退勤リマインダー・iOS制限考慮） | 未着手 |
