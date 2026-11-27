---
theme: default
title: AssetConverter — 3分で読む技術解説
routerMode: hash
colorSchema: dark
fonts:
  sans: Space Grotesk
  mono: JetBrains Mono
---

# AssetConverter

ゲームの2D素材を軽量化・圧縮・変換する Windows 専用の GUI ツール

<p class="dim">2026.07 - 現在 / 個人開発 / Microsoft Store で公開 / C++・WinUI 3</p>

---

# 画像をまとめて最適化する

- ファイルやフォルダをドラッグ&ドロップし、プリセットを選んで実行する
- プリセットは 汎用 / Unity 向け / Unreal 向け / 自作 DirectX 向け
- 形式・最大サイズ・ミップの有無がプリセットで決まる
- GUI と同じ処理系を叩くコンソール版も付属する
- フォルダに3Dモデルや音声が混ざっていても一覧に入らない

---
layout: two-cols
---

# 外部ライブラリは OS の機能に置き換える

自作するかは、機能がツールの目的にどれだけ近いかで決める。

Windows 専用と割り切り、「外部ライブラリ」の大半を **OS の機能を呼ぶ**形にした。

外部依存は 2 件だけ。

::right::

| 機能 | 使っているもの |
| --- | --- |
| 画像の変換・リサイズ | WIC |
| 汎用圧縮 | Compression API |
| BC7 圧縮 | DirectXTex |
| GUI | WinUI 3 |

<p class="dim">TGA と DDS の BC7 は OS が読めないので自前で書いた</p>

---

# 縮小はリニア空間で、アルファで重み付けする

```cpp {1-9|10-14|all}
FloatPixel ReadPremultiplied(const ImageData& image, uint32_t x, uint32_t y, bool srgb) {
    const size_t at = (static_cast<size_t>(y) * image.width + x) * 4;
    const double alpha = static_cast<double>(image.pixels[at + 3]) / 255.0;
    const auto colour = [&](size_t channel) {
        const double encoded = static_cast<double>(image.pixels[at + channel]) / 255.0;
        return (srgb ? SrgbToLinear(encoded) : encoded) * alpha;
    };
    return FloatPixel{colour(0), colour(1), colour(2), alpha};
}
// ... Lanczos フィルタ処理 ...
const auto straight = [&](double premultiplied) {
    const double linear = std::clamp(premultiplied * inverseAlpha, 0.0, 1.0);
    return ToByte(srgb ? LinearToSrgb(linear) : linear);
};
```

sRGB のまま平均すると暗くなり、透明部分の黒が縁に滲む。

---

# ファイルサイズと VRAM を別の列で見せる

**BC 圧縮は GPU メモリを削る仕組みで、ファイルを小さくするものではない。**

```
2600x1800 の PNG   692 KB  →  DDS  3.0 MB    ファイルは +340%
           VRAM  23.8 MB  →      3.0 MB    VRAM は -87.5%
```

「軽量化ツール」でファイルが大きくなると失敗に見える。一覧では「削減率」と「VRAM」を別々の列で出す。

---

# .acpk は 1 シークで任意のエントリへ届く

```cpp {2-12|13|all}
// src/runtime/AcpkReader.h
struct EntryRecord {
    uint64_t pathHash;
    uint32_t pathOffset;
    uint32_t pathLength;
    uint64_t dataOffset;
    uint64_t rawSize;
    uint64_t compressedSize;
    uint16_t algorithm;
    uint16_t reserved;
    uint32_t crc32;
};
static_assert(sizeof(EntryRecord) == 48);
```

ヘッダと TOC だけ読めばよく、TOC は 1 件 48 バイトの固定長。パスはハッシュで引く。

---

# エラーメッセージが嘘をつかないことを基準にする

<v-clicks>

- **TGA** — 32bit で属性ビット 0 のファイルは BGRX として読む
- **0 バイトと Git LFS のポインタ** — 変換前に弾いて理由を出す
- **読み取り専用のファイル** — 元ファイル置換でも消さない
- **長いパス** — 「パスが N 文字あります」とログに出す

</v-clicks>

---

# 3D モデルと音声を対象から外した

- 4 種類すべてを一度は実装し終えたうえでの判断
- 保守・設定画面・ビルド時間の負担になっていた
- **フォルダを落としたとき、隣のモデルや音声まで変換される誤爆**があった
- 機能を増やすより、担当範囲だけを持つ道具のほうが扱いやすい

<p class="dim">詳しくはこの下の本文へ</p>
