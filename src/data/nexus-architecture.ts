/**
 * Nexus の全体構成図。
 * 上の段のモジュールが下の段のモジュールを使う並びにしている。deps は各モジュールの CMake の依存先。
 * 詳細は src/content/nexus/<id>.md に書き、ブロックはその中の見出しへ飛ぶ。
 * 見出しが見つからないブロックがあるとビルドが止まる。
 */
export interface MapBlock {
  label: string;
  /** 飛び先の見出し。省略時は label と同じ文字列の見出しへ飛ぶ */
  heading?: string;
}

export interface MapModule {
  id: string;
  name: string;
  label: string;
  /** 横幅の比率 */
  span: number;
  deps?: string[];
  /** 実装が途中のものに付ける短い注記 */
  note?: string;
  /** 構成図で強調する */
  accent?: boolean;
  /** true のブロックは見出しを持たず、詳細の先頭へ飛ぶ */
  plainBlocks?: boolean;
  /** 詳細を持たず、作品ページ本文のこの見出しへ飛ぶ */
  pageHeading?: string;
  blocks: MapBlock[];
}

export interface MapRow {
  title: string;
  modules: MapModule[];
}

const blocks = (...labels: string[]): MapBlock[] => labels.map((label) => ({ label }));

export const ARCHITECTURE: MapRow[] = [
  {
    title: 'アプリケーション',
    modules: [
      { id: 'editor', name: 'Editor', label: 'エディタ', span: 3, note: '開発中', blocks: blocks('エディタコア', 'C ABI', 'C# UI') },
      { id: 'server', name: 'Server', label: '専用サーバ', span: 2, plainBlocks: true, blocks: blocks('ヘッドレス実行') },
      { id: 'tools', name: 'Tools', label: '開発ツール', span: 3, blocks: blocks('NexusCook', 'JobBench', 'RhiSelfTest') },
      {
        id: 'samples',
        name: 'Samples',
        label: 'デモ',
        span: 4,
        pageHeading: 'デモ — エンジンで何が動くか',
        blocks: [
          { label: 'NexusDefense', heading: 'NexusDefense — フレームレートが体力のタワーディフェンス' },
          { label: 'NightCrossing', heading: 'NightCrossing — 統合レンダリングデモ' },
        ],
      },
    ],
  },
  {
    title: 'ゲーム実行基盤',
    modules: [
      {
        id: 'runtime',
        name: 'Runtime',
        label: '実行基盤',
        span: 5,
        deps: ['foundation', 'platform', 'rhi', 'network'],
        blocks: blocks('ゲームループ', '画面とフロー', 'UI', 'シネマティクス', 'コンソール', 'ローカライズ'),
      },
      {
        id: 'resource',
        name: 'Resource',
        label: 'リソース',
        span: 4,
        deps: ['foundation', 'platform', 'renderer', 'animation'],
        blocks: blocks('アセットデータベース', 'クッカー', '画像パーサ', 'モデルパーサ', 'フォント'),
      },
      {
        id: 'scripting',
        name: 'Scripting',
        label: 'スクリプト',
        span: 3,
        deps: ['foundation'],
        note: '開発中',
        blocks: [
          { label: '.NET', heading: '.NET ホスト' },
          { label: 'Python', heading: 'Python ホスト' },
          { label: 'ネイティブ', heading: 'ネイティブモジュール' },
        ],
      },
    ],
  },
  {
    title: '描画',
    modules: [
      {
        id: 'renderer',
        name: 'Renderer',
        label: 'レンダラ',
        span: 10,
        deps: ['foundation', 'rhi'],
        blocks: blocks('レンダーグラフ', 'メッシュとトゥーン', 'DDGI', 'ハイブリッドレイトレ', 'パストレーシング', 'ポストプロセス', 'パーティクル', 'ボリュームライト'),
      },
      {
        id: 'imgui',
        name: 'ImGui',
        label: 'デバッグ UI',
        span: 2,
        deps: ['foundation', 'platform', 'rhi'],
        plainBlocks: true,
        blocks: blocks('バックエンド'),
      },
    ],
  },
  {
    title: 'ゲーム機能',
    modules: [
      { id: 'network', name: 'Network', label: 'ネットワーク', span: 1, deps: ['foundation', 'scene'], blocks: blocks('トランスポート', 'レプリケーション', '予測', 'セッション') },
      { id: 'animation', name: 'Animation', label: 'アニメーション', span: 1, deps: ['foundation'], blocks: blocks('ステートマシン', 'IK', 'ポーズブレンド', 'リターゲット') },
      { id: 'physics', name: 'Physics', label: '物理', span: 1, deps: ['foundation'], blocks: blocks('2D 物理', '3D 物理', 'キャラクター', 'Verlet') },
      { id: 'audio', name: 'Audio', label: 'オーディオ', span: 1, deps: ['foundation'], blocks: blocks('ミキサと DSP', '3D 音響', 'ストリーミング', 'WASAPI 出力') },
      { id: 'ai', name: 'AI', label: 'AI', span: 1, deps: ['foundation'], blocks: blocks('経路探索', '行動決定', 'ステアリング', '知覚') },
    ],
  },
  {
    title: '中核',
    modules: [
      {
        id: 'scene',
        name: 'Scene',
        label: 'シーン（並列ECS）',
        span: 1,
        deps: ['foundation'],
        accent: true,
        blocks: [
          { label: '並列ECS', heading: '並列ECS — 衝突をコードに宣言させる' },
          { label: 'スケジューラ', heading: '採った方法' },
          { label: '空間構造' },
          { label: 'シリアライズ' },
        ],
      },
      {
        id: 'rhi',
        name: 'RHI',
        label: '描画APIの抽象化',
        span: 1,
        deps: ['foundation', 'platform'],
        accent: true,
        blocks: [
          { label: '薄い抽象化', heading: '抽象化の粒度を「薄く」に決めた' },
          { label: 'DirectX 12 / Vulkan', heading: '実装順は Vulkan から' },
          { label: 'HLSL シェーダ', heading: 'シェーダは HLSL に統一' },
          { label: 'CI での実描画' },
        ],
      },
    ],
  },
  {
    title: 'OS の抽象化',
    modules: [
      {
        id: 'platform',
        name: 'Platform',
        label: 'プラットフォーム',
        span: 1,
        deps: ['foundation'],
        blocks: blocks('ウィンドウ', '入力', 'ファイルシステム', 'クラッシュダンプ'),
      },
    ],
  },
  {
    title: '基盤',
    modules: [
      {
        id: 'foundation',
        name: 'Foundation',
        label: '基盤ライブラリ',
        span: 1,
        blocks: blocks('メモリアロケータ', 'ジョブシステム', '数学・コンテナ', 'リフレクション', 'プロファイラ', '設定（CVar）'),
      },
    ],
  },
  {
    title: '外部',
    modules: [
      {
        id: 'thirdparty',
        name: 'OS / SDK',
        label: '自作しないもの',
        span: 1,
        plainBlocks: true,
        blocks: blocks('Win32', 'Direct3D 12', 'Vulkan', 'DXC', 'WASAPI', 'Dear ImGui', '.NET', 'Python', 'DLSS / FSR'),
      },
    ],
  },
];

export const MODULES: MapModule[] = ARCHITECTURE.flatMap((row) => row.modules);
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
