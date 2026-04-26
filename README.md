# kintai
# 勤怠管理アプリ 実装指示書

## あなたの役割
このプロジェクトは個人用勤怠管理PWAアプリの実装です。
以下の指示に従い、Step 1から順番に実装してください。
各Stepが完了したら次のStepへ自動で進んでください。

---

## プロジェクト概要

会社の勤怠管理が紙のタイムカード方式で、直行・直帰・出張時に記録できないため、
自分専用の勤怠管理アプリを作る。

**動作環境**
- メインデバイス: iPhone（Safari）
- サブ: PC（Chrome）
- インストール方法: ホーム画面に追加（PWA）※App Store不要
- オフライン動作必須
- データ保存: localStorage（サーバー不要）
- ホスティング: GitHub Pages（無料）

**勤務基本設定**
- 所定労働時間: 8:30〜17:30
- 休憩時間: 1時間（自動控除）
- 実働時間: 7.5時間／日
- 残業の定義: 17:30以降の勤務時間
- 休日: 土・日・日本の祝日

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| UIフレームワーク | React 18 + TypeScript |
| スタイル | Tailwind CSS |
| ビルド | Vite |
| PWA | vite-plugin-pwa |
| 祝日データ | jpholiday-js |
| データ保存 | localStorage |
| ホスティング | GitHub Pages |

---

## データ構造（localStorage）

```typescript
// キー: "kintai_records"
type DailyRecord = {
  date: string;          // "2026-04-26"
  isWorked: boolean;     // 出勤フラグ
  workType: "出社" | "直行" | "直帰" | "出張" | "在宅" | null;
  startTime: string;     // "08:30"
  endTime: string;       // "17:30"
  breakMinutes: number;  // 60（固定）
  memo: string;          // 備考
  isHoliday: boolean;    // 有給フラグ
};

// キー: "kintai_settings"
type Settings = {
  holidayDays: number;   // 年間有給付与日数（デフォルト20）
  reminderTime: string;  // 通知時刻（デフォルト"17:00"）
  startYear: number;     // 有給カウント開始年
};
```

---

## カラーガイド

| 要素 | カラーコード |
|------|-------------|
| 土曜日 | #2563EB（青） |
| 日曜日・祝日 | #DC2626（赤） |
| 出勤済みセル | #16A34A（緑） |
| 今日のセル枠 | #1D4ED8（青枠） |
| 残業時間テキスト | #DC2626（赤） |
| 警告（残業45h超・有給残少） | #D97706（橙） |

---

## UI要件

- タップ可能な要素は最小 44px × 44px
- フォントサイズは最小 16px（入力欄含む）
- ダークモード・ライトモード両対応
- 説明なしで直感的に使えるシンプルなUI

**画面構成**
1. メイン画面: 月別カレンダー + 月次サマリーバー
2. 日次詳細モーダル: 出退勤時刻・勤務区分・備考の入力
3. 設定画面: 所定労働時間・有給日数・通知時刻

---

## GitHub Actions設定（自動デプロイ）

`.github/workflows/deploy.yml` を以下の内容で作成すること：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

`vite.config.ts` に以下を追加すること（リポジトリ名が `kintai` の場合）：

```typescript
export default defineConfig({
  base: '/kintai/',
  // ...
})
```

---

## 実装手順（この順番で進めること）

### Step 1: プロジェクト初期化
- Vite + React + TypeScript でプロジェクト作成
- Tailwind CSS のセットアップ
- vite-plugin-pwa のインストール・設定
- jpholiday-js のインストール
- GitHub Actions のデプロイ設定ファイル作成

### Step 2: カレンダーUI
- 月別グリッド表示（日〜土の7列）
- 土曜=青、日曜・祝日=赤の色分け
- 祝日名をセル内に小テキストで表示
- 今日のセルを青枠でハイライト
- 「＜前月」「翌月＞」ボタンで月移動

### Step 3: 勤怠入力モーダル
- 日付セルをタップ→モーダルを表示
- 出勤チェック（✓）のトグル
- 勤務区分の選択: 出社 / 直行 / 直帰 / 出張 / 在宅
- 出勤時刻入力（デフォルト: 08:30）
- 退勤時刻入力（デフォルト: 17:30）
- 実働時間の自動計算（退勤 - 出勤 - 休憩60分）
- 17:30以降の残業時間を赤文字で表示
- 備考テキスト入力
- 入力の都度 localStorage に自動保存

### Step 4: 月次サマリーバー
- カレンダー上部に表示
- 出勤日数・総実働時間・残業時間合計・有給取得日数
- 残業時間が45時間超で警告表示

### Step 5: PWA化
- manifest.json の設定
  - name: "勤怠管理"
  - short_name: "勤怠"
  - display: "standalone"
  - theme_color: "#1D4ED8"
- Service Worker の設定（NetworkFirst戦略）
- アプリアイコン生成（192px・512px）
- オフライン動作の確認

### Step 6: GitHub Pages公開
- `npm run build` でビルド確認
- GitHub Actions で自動デプロイ
- README.md にiPhoneホーム画面追加手順を記載

```
【iPhoneへのインストール方法】
1. iPhoneのSafariでアプリのURLを開く
2. 画面下部の「共有」ボタンをタップ
3.「ホーム画面に追加」を選択
4.「追加」をタップ
```

### Step 7: 有給休暇管理
- 設定画面で年間付与日数を入力（デフォルト20日）
- モーダルで有給チェックをトグル
- 残日数を自動カウントダウン
- 残り5日以下で警告色表示

### Step 8: CSVエクスポート
- 月単位でCSVダウンロード
- 出力項目: 日付・曜日・祝日名・勤務区分・出勤時刻・退勤時刻・実働時間・残業時間・備考
- 文字コード: UTF-8 BOM付き（Excelで直接開ける）

### Step 9: ブラウザ通知
- 退勤リマインダー通知
- 設定画面で通知時刻を変更可能
- iOS Safariの通知制限を考慮した実装

---

## 完了条件

- [ ] iPhoneのSafariでホーム画面に追加できる
- [ ] オフラインで動作する
- [ ] 出退勤時刻を記録できる
- [ ] 土日祝が正しく色分けされている
- [ ] データがlocalStorageに保存される
- [ ] GitHub PagesのURLでアクセスできる
- [ ] TypeScriptのエラーが0件

---

## コミットルール

```
feat: Step1 プロジェクト初期化
feat: Step2 カレンダーUI実装
feat: Step3 勤怠入力モーダル実装
...
```
