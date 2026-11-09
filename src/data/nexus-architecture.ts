/**
 * Nexus の全体構成図。
 * 上の段のモジュールが下の段のモジュールを使う並びにしている。deps は各モジュールの CMake の依存先。
 *
 * 解説は src/content/nexus/ に置く。
 *   <id>.md         モジュールの概要  → /works/nexus/<id>/
 *   <id>/<slug>.md  サブシステムの解説 → /works/nexus/<id>/<slug>/
 * ファイルが欠けているとビルドが止まる。
 */
export interface MapBlock {
  /** | は図の中で折り返してよい位置（カタカナ語が途中で切れないようにする） */
  label: string;
  /** 省略すると、モジュールの概要へ飛ぶ */
  slug?: string;
  /** 作品ページ本文のこの見出しへ飛ぶ */
  pageHeading?: string;
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
  /** 解説を持たず、作品ページ本文のこの見出しへ飛ぶ */
  pageHeading?: string;
  blocks: MapBlock[];
}

export interface MapRow {
  title: string;
  modules: MapModule[];
}

const b = (label: string, slug?: string): MapBlock => ({ label, slug });

export const ARCHITECTURE: MapRow[] = [
  {
    title: 'アプリケーション',
    modules: [
      {
        id: 'editor',
        name: 'Editor',
        label: 'エディタ',
        span: 3,
        note: '開発中',
        blocks: [b('エディタ|コア', 'core'), b('C ABI', 'c-abi'), b('C# UI', 'csharp-ui')],
      },
      { id: 'server', name: 'Server', label: '専用サーバ', span: 2, blocks: [b('ヘッドレス|実行')] },
      {
        id: 'tools',
        name: 'Tools',
        label: '開発ツール',
        span: 3,
        blocks: [b('NexusCook', 'nexus-cook'), b('JobBench', 'job-bench'), b('RhiSelfTest', 'rhi-self-test')],
      },
      {
        id: 'samples',
        name: 'Samples',
        label: 'デモ',
        span: 4,
        pageHeading: 'デモ — エンジンで何が動くか',
        blocks: [
          { label: 'NexusDefense', pageHeading: 'NexusDefense — フレームレートが体力のタワーディフェンス' },
          { label: 'NightCrossing', pageHeading: 'NightCrossing — 統合レンダリングデモ' },
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
        blocks: [
          b('ゲーム|ループ', 'game-loop'),
          b('画面と|フロー', 'screen-flow'),
          b('UI', 'ui'),
          b('シネマ|ティクス', 'cinematics'),
          b('コンソール', 'console'),
          b('ローカライズ', 'localization'),
        ],
      },
      {
        id: 'resource',
        name: 'Resource',
        label: 'リソース',
        span: 4,
        deps: ['foundation', 'platform', 'renderer', 'animation'],
        blocks: [
          b('アセット|データベース', 'asset-database'),
          b('クッカー', 'cooker'),
          b('画像|パーサ', 'image-parsers'),
          b('モデル|パーサ', 'model-parsers'),
          b('フォント', 'font'),
        ],
      },
      {
        id: 'scripting',
        name: 'Scripting',
        label: 'スクリプト',
        span: 3,
        deps: ['foundation'],
        note: '開発中',
        blocks: [b('.NET', 'dotnet'), b('Python', 'python'), b('ネイティブ', 'native-module')],
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
        blocks: [
          b('レンダー|グラフ', 'render-graph'),
          b('メッシュと|トゥーン', 'mesh-toon'),
          b('DDGI', 'ddgi'),
          b('ハイブリッド|レイトレ', 'hybrid-rt'),
          b('パス|トレーシング', 'path-tracing'),
          b('ポスト|プロセス', 'post-process'),
          b('パーティクル', 'particles'),
          b('ボリューム|ライト', 'volumetric'),
        ],
      },
      {
        id: 'imgui',
        name: 'ImGui',
        label: 'デバッグ UI',
        span: 2,
        deps: ['foundation', 'platform', 'rhi'],
        blocks: [b('バック|エンド')],
      },
    ],
  },
  {
    title: 'ゲーム機能',
    modules: [
      {
        id: 'network',
        name: 'Network',
        label: 'ネットワーク',
        span: 1,
        deps: ['foundation', 'scene'],
        blocks: [
          b('トランス|ポート', 'transport'),
          b('レプリ|ケーション', 'replication'),
          b('予測', 'prediction'),
          b('セッション', 'session'),
        ],
      },
      {
        id: 'animation',
        name: 'Animation',
        label: 'アニメーション',
        span: 1,
        deps: ['foundation'],
        blocks: [b('ステート|マシン', 'state-machine'), b('IK', 'ik'), b('ポーズ|ブレンド', 'pose-blend'), b('リター|ゲット', 'retarget')],
      },
      {
        id: 'physics',
        name: 'Physics',
        label: '物理',
        span: 1,
        deps: ['foundation'],
        blocks: [b('2D 物理', 'physics-2d'), b('3D 物理', 'physics-3d'), b('キャラ|クター', 'character'), b('Verlet', 'verlet')],
      },
      {
        id: 'audio',
        name: 'Audio',
        label: 'オーディオ',
        span: 1,
        deps: ['foundation'],
        blocks: [b('ミキサと|DSP', 'mixer-dsp'), b('3D 音響', 'spatial'), b('ストリー|ミング', 'streaming'), b('WASAPI|出力', 'wasapi')],
      },
      {
        id: 'ai',
        name: 'AI',
        label: 'AI',
        span: 1,
        deps: ['foundation'],
        blocks: [b('経路探索', 'pathfinding'), b('行動決定', 'decision'), b('ステア|リング', 'steering'), b('知覚', 'perception')],
      },
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
        blocks: [b('並列ECS', 'ecs'), b('スケジューラ', 'scheduler'), b('空間構造', 'spatial'), b('シリアライズ', 'serialization')],
      },
      {
        id: 'rhi',
        name: 'RHI',
        label: '描画APIの抽象化',
        span: 1,
        deps: ['foundation', 'platform'],
        accent: true,
        blocks: [b('薄い抽象化', 'thin-abstraction'), b('DirectX 12 / Vulkan', 'dual-backend'), b('HLSL|シェーダ', 'hlsl'), b('CI での|実描画', 'ci-rendering')],
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
        blocks: [b('ウィンドウ', 'window'), b('入力', 'input'), b('ファイル|システム', 'filesystem'), b('クラッシュ|ダンプ', 'crash-dump')],
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
        blocks: [
          b('メモリ|アロケータ', 'allocators'),
          b('ジョブ|システム', 'job-system'),
          b('数学・|コンテナ', 'math-containers'),
          b('リフレク|ション', 'reflection'),
          b('プロファイラ', 'profiler'),
          b('設定（CVar）', 'cvar'),
        ],
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
        blocks: ['Win32', 'Direct3D 12', 'Vulkan', 'DXC', 'WASAPI', 'Dear ImGui', '.NET', 'Python', 'DLSS / FSR'].map((l) => b(l)),
      },
    ],
  },
];

export const MODULES: MapModule[] = ARCHITECTURE.flatMap((row) => row.modules);
export const moduleById = (id: string) => MODULES.find((m) => m.id === id);

/** 図の折り返し位置を外した表示名 */
export const plainLabel = (label: string) => label.replaceAll('|', '');
/** 図のラベル。ゼロ幅スペースを折り返し位置にする */
export const mapLabel = (label: string) => label.replaceAll('|', '​');

export const moduleHref = (id: string) => `/works/nexus/${id}/`;
export const subsystemHref = (id: string, slug: string) => `/works/nexus/${id}/${slug}/`;
/** 解説ページを持つモジュール */
export const DOC_MODULES = MODULES.filter((m) => !m.pageHeading);
