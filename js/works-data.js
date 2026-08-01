/*
 * 作品データ
 * ------------------------------------------------------------------
 * 作品を追加・編集するときは、このファイルの WORKS 配列だけを触れば OK です。
 * ビルドは不要で、保存してブラウザを再読み込みすれば反映されます。
 *
 * 各項目の意味:
 *   id          … 内部用の一意なID（半角英数とハイフン）
 *   title       … 作品名
 *   year        … 制作年（"2026" や "2025.10" など自由）
 *   category    … カードに出す小さなラベル（"チーム制作" / "個人制作" / "ツール" など）
 *   role        … 自分の担当範囲
 *   tech        … 使用技術の配列。ここから絞り込みボタンが自動生成されます
 *   summary     … カードに出る1〜2行の概要
 *   description … 詳しい説明。こだわった点・工夫した点を書くと伝わりやすいです
 *   image       … スクリーンショットのパス（例 "assets/images/nexus.png"）
 *                 空文字 "" にするか、画像が無い場合は自動でプレースホルダになります
 *   links       … { label: "表示名", url: "URL" } の配列。空配列 [] でリンク無し
 *
 * 注意: 非公開(private)リポジトリの URL を links に入れても、
 *       訪問者からは 404 に見えます。公開しているものだけ載せてください。
 */

const WORKS = [
  {
    id: "nexus",
    title: "Nexus",
    year: "2026",
    category: "【個人制作 / チーム制作】",
    role: "【担当範囲を記入】",
    tech: ["C++"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【技術的にこだわった点、苦労した点、工夫した点などを書いてください】",
    image: "",
    links: []
  },
  {
    id: "asset-converter",
    title: "AssetConverter",
    year: "2026",
    category: "ツール",
    role: "【担当範囲を記入】",
    tech: ["C++"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【どんな課題を解決するツールか、どう実装したかを書いてください】",
    image: "",
    links: []
  },
  {
    id: "aurea-hew",
    title: "Aurea",
    year: "2026",
    category: "チーム制作",
    role: "【担当範囲を記入】",
    tech: ["C++", "DirectX"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【チーム構成・自分の担当・技術的な工夫を書いてください】",
    image: "",
    links: []
  },
  {
    id: "dx21-x01",
    title: "DX21_X01",
    year: "2025",
    category: "個人制作",
    role: "【担当範囲を記入】",
    tech: ["C++", "DirectX"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【技術的にこだわった点を書いてください】",
    image: "",
    links: []
  },
  {
    id: "discord-ai-bot",
    title: "Discord AI Bot",
    year: "2026",
    category: "個人制作",
    role: "個人開発",
    tech: ["JavaScript", "Node.js"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【使っているAPI、機能、工夫した点などを書いてください】",
    image: "",
    links: []
  },
  {
    id: "hew",
    title: "HEW",
    year: "2025",
    category: "チーム制作",
    role: "【担当範囲を記入】",
    tech: ["C++"],
    summary: "【1〜2行で作品の概要を書いてください】",
    description: "【作品の内容と自分の担当を書いてください】",
    image: "",
    links: [
      { label: "GitHub", url: "https://github.com/Nerunell11/HEW" }
    ]
  }
];
