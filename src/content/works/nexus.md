---
title: Nexus
period: 2026.07 - 現在
category: 個人開発
tech: ["C++", "DirectX 12", "Vulkan", "HLSL"]
summary: |-
  C++20 でフルスクラッチ開発している 2D/3D ゲームエンジン。
  並列ECSを中核に据え、DirectX 12 と Vulkan を自作のRHIで抽象化しています。
cover: /images/works/nexus-pbr.webp
order: 20
featured: true
ongoing: true
links: []
---

## 概要

高いパフォーマンスと高品質なグラフィックスの両立を目指して、C++20 でフルスクラッチ開発しているゲームエンジンです。Windows と Linux をターゲットにしています。

OS とツールチェーン相当のもの以外は、原則として外部ライブラリに頼らず自作しています。数学・コンテナ・アロケータから、PNG / JPEG / EXR / FBX / glTF のパーサ、ネットワーク層までが対象です。

設計上の制約として、**例外と RTTI を使いません**。エラーは `Result<T>` とアサートで扱い、`new` / `delete` を直接書かずアロケータ経由で確保します。

## 並列ECS — 衝突をコードに宣言させる

### 解きたかった問題

ECS のストレージはアーキタイプ方式で並列化に向いた形でしたが、走査が1エンティティ単位しかなく、仕事をジョブに切り出す単位がありませんでした。

素朴に「システムを全部ジョブに投げる」と、同じコンポーネントを触るシステム同士がデータ競合します。そして**競合の有無を人間が管理する方式は、システムが増えたときに必ず破綻します**。

さらにオンライン対戦のために決定論シミュレーションが必要で、並列化しても実行ごとに結果が変わってはいけないという条件がありました。スレッドの実行順が結果に漏れる余地を、設計で塞ぐ必要があります。

### 採った方法

システムが触るコンポーネントを、型で宣言させることにしました。

NexusDefense で実際に登録しているコードです。

```cpp
// Samples/TowerDefense/Core/TdSystems.cpp
scheduler.Add<nx::Reads<TdPosition, TdEnemyStats, TdLagState>,
              nx::Writes<TdVelocity>>(
    "TD/EnemyAI", &EnemyAiSystem, &context);
scheduler.Add<nx::Reads<TdVelocity>, nx::Writes<TdPosition>>(
    "TD/Movement", &MovementSystem, &context);
```

アクセス集合はビットセットで保持し、2つのシステムが衝突するのは次のいずれかの場合です。

- `A.writes ∩ B.writes ≠ ∅`
- `A.writes ∩ B.reads ≠ ∅`
- `A.reads ∩ B.writes ≠ ∅`

読み取り同士は衝突しません。判定に**集合の等値性しか使わない**ので、型IDの値が実行ごとに変わっても結果は変わりません。

そのうえで、ウェーブ（段）への割り当てを登録順だけで決めます。

- 衝突するシステム同士は、必ず登録順どおりに実行される
- 同じウェーブのシステムは互いに衝突しないので、実行順に関係なく結果が同じ

この2つから、**並列実行の結果は登録順の直列実行と必ず一致します**。デバッグ用の直列実行パスを用意し、両者が一致することをテストで突き合わせています。

エンティティの生成・破棄といった構造変更は、システムごとのコマンドバッファに積み、ウェーブの境界で呼び出しスレッドが登録順に適用します。どのシステムが先に終わったかは、適用順に影響しません。

主要なクラスの関係です。

```mermaid
classDiagram
direction TB
class World
class Archetype
class Chunk
class SystemScheduler
class SystemContext
class JobSystem
class EntityCommandBuffer
World *-- Archetype : 保持
Archetype *-- Chunk : 所有
SystemScheduler --> JobSystem : ジョブを投入
SystemScheduler --> SystemContext : 実行ごとに生成
SystemContext --> World : 読み書き
SystemContext --> JobSystem : チャンクを分配
SystemContext --> EntityCommandBuffer : 構造変更を積む
SystemScheduler *-- EntityCommandBuffer : システムごとに1つ
```

1フレームの実行の流れです。

```mermaid
sequenceDiagram
participant F as フレーム
participant S as SystemScheduler
participant J as JobSystem
participant Y as System
participant W as World
participant C as EntityCommandBuffer
F->>S: Run(World, JobSystem)
S->>S: アクセス集合から<br/>ウェーブを決める
loop ウェーブを順に
  S->>J: 同じウェーブの<br/>システムを投入
  J->>Y: SystemContext を<br/>渡して実行
  Y->>W: 宣言した<br/>コンポーネントだけ読み書き
  Y->>C: 構造変更を積む
  S->>J: 全ジョブの完了を待つ
  J-->>S: ウェーブ完了
  S->>C: 登録順に適用
  C->>W: 生成・破棄・追加・削除
end
S-->>F: 全システム完了
```

## デュアルRHI — DirectX 12 と Vulkan を同じAPIで

### 抽象化の粒度を「薄く」に決めた

DirectX 12 と Vulkan は、コマンドバッファ・明示的同期・ディスクリプタ管理という点で世代が揃っているため、共通の抽象を置けます。

方針として **RHI 自体は賢くしない**ことに決めました。Device / Queue / CommandList / Pipeline / DescriptorSet / Resource / Barrier を両APIとほぼ1対1で表現するに留め、バリアやディスクリプタの自動化は上位のレンダグラフ層に任せます。

抽象インターフェースと、各バックエンドの実装の関係です。

```mermaid
classDiagram
direction TB
class IDevice
class ICommandList
class ISwapchain
class VulkanDevice
class VulkanCommandList
class VulkanSwapchain
class D3D12Device
class D3D12CommandList
class D3D12Swapchain
IDevice <|-- VulkanDevice
IDevice <|-- D3D12Device
ICommandList <|-- VulkanCommandList
ICommandList <|-- D3D12CommandList
ISwapchain <|-- VulkanSwapchain
ISwapchain <|-- D3D12Swapchain
VulkanDevice *-- VulkanCommandList
VulkanDevice *-- VulkanSwapchain
D3D12Device *-- D3D12CommandList
D3D12Device *-- D3D12Swapchain
IDevice --> ICommandList : フレームごとに提供
IDevice --> ISwapchain : 生成
```

厚い抽象（OpenGL 風に隠蔽する形）は、商用レベルの性能要件と矛盾するため採りませんでした。DX11 / OpenGL 世代まで対応する案も、抽象化の最小公倍数が古い世代に引きずられて明示的APIの性能が出ないため却下しています。

### シェーダは HLSL に統一

シェーダは HLSL で統一して書き、DXC で DXIL（DX12用）と SPIR-V（Vulkan用）の両方へオフラインコンパイルします。シェーダコンパイラだけは、自作が非現実的なためフルスクラッチ方針の例外としています。

### 実装順は Vulkan から

機能追加は「Vulkan 実装 → DX12 実装 → 共通テスト」の順で進めています。**Vulkan のほうが制約が厳しく、Vulkan で正しい設計は DX12 へ移植しやすい**ためです。逆順だと、DX12 で通る緩い設計を Vulkan 側で作り直すことになります。

## デモ — エンジンで何が動くか

### NexusDefense — フレームレートが体力のタワーディフェンス

ECS の性能を見せるためのデモです。**フレームレートそのものを体力にしました。** 30 FPS を5秒間下回ると `SYSTEM OVERLOAD` で敗北します。

「大量に表示できます」ではなく、**大量のエンティティが AI・移動・衝突・ダメージ・生成破棄をしながら回り続けられるか**が、そのまま勝敗になります。

防壁の HP は画面に出していません。負ける条件がフレームレートだけなので、体力バーを出すと「もう一つの負け方がある」という嘘になるためです。

実測（Ryzen 7 9800X3D / Radeon RX 9070 / x64-release / Vulkan / 15ワーカースレッド）

| 敵 | Entities | Frame | FPS | ECS | Spawn/Destroy |
| --: | --: | --: | --: | --: | --: |
| 9,822 | 18,568 | 1.12 ms | 892.2 | 0.32 ms | 0.05 ms |
| 99,269 | 114,628 | 3.56 ms | 281.1 | 1.70 ms | 0.18 ms |
| 397,765 | 425,766 | 13.72 ms | 72.9 | 6.97 ms | 0.62 ms |
| **795,928** | **840,954** | **30.84 ms** | **32.4** | 14.62 ms | 1.43 ms |

すべての段で**実際に描画されるフレームを回しています**。ヘッドレスのシミュレーションではないので、抽出・描画提出・GPU の時間も数字に入っています。

ただしこの表は1回の実行で、計測したのはブラウザもエディタも動いている普通の開発機です。同じ80万体の段を繰り返すと 30.84 / 31.20 / 30.84 ms に散り、p99 は 39.8 / 49.2 / 44.4 ms まで跳ねます。**そのまま限界値として読めるものではありません。**

#### 計測自体が壊れていた話

ベンチの弾は防壁から速度30・寿命2秒で撃っていました。飛距離60に対して、敵が湧くのは118ユニット先です。**弾は一度も敵に届いていませんでした。**

円形アリーナだった頃は発射点が中央にあって届いていて、レーン型に変えて発射点を壁へ移したときに壊れていました。結果としてベンチは「弾が敵を殺し続けるので補充する」と書きながら撃破を1件も起こしておらず、**撃破 → 破棄 → 補充という ECS で一番重い往復を測っていませんでした。**

気づいたのは、ビルボードの煙と火花を足したときに枚数の列が全段0になっていたからです。狙って見つけたわけではありません。弾速を直したいま、80万体の段で Spawn/Destroy は 1.28 ms になっています。

### NightCrossing — 統合レンダリングデモ

荒天の夜、手漕ぎボートで岩礁の灯台へ向かうデモです。Gerstner 波、豪雨としぶき、水面への局所光の映り込み、DDGI、灯台のボリューム光、被写界深度・フレア・自動露出・寒色グレーディングを、**ひとつのレンダーグラフで**実行します。

<video src="/images/works/nexus-nightcrossing.mp4#t=0.1" poster="/images/works/nexus-nightcrossing.webp" controls loop muted playsinline preload="metadata" width="1280" height="720"></video>

| | 値 |
| --- | --- |
| 水面 | 半径 480m、格子 256x256（中心を密に、外周を粗く） |
| 波 | 波長 38 / 24 / 17 / 11 / 8 / 6m、合計振幅 約 2.4m |
| ボリューム散乱 | 散乱係数 0.055 /m、80ステップ、最大 140m、半解像度 |

#### 見た目を数値で検証する

このデモは 240 フレーム走らせ、読み戻した画像から 22 項目を自動判定します。**すべての判定に下限と上限の両方**を置いてあります。下限だけだと、強度を極端な値にすれば通ってしまうためです。

たとえば `horizonIsRough`（海に起伏がある）と `horizonNotAliased`（縞が出ていない）は互いに逆方向に効くので、両方を同時に満たす必要があります。雨のざらつきで起伏の判定が通ってしまわないよう、海の判定は雨を切ったフレームで測ります。

この作り方にしたのは、**画面を覆う黒い矩形がフレームによって出たり出なかったりする不具合**を踏んだからです。静止画1枚の確認では見逃せました。それ以降、連続フレームを撮って異常画素の割合を数値で出すようにしています。

ほかに、水面デモ、ライティングスタジオ、スキンメッシュのキャラクターデモ、サーバ権威のネット対戦サンプルがあります。

## 設計の記録

主要な設計判断は ADR（Architecture Decision Record）として、文脈・決定・却下した代替案まで含めて記録しています。現在33本あります。

テストは自作のテストランナーで各モジュールに同梱し、1,186個のユニットテストが動いています。
