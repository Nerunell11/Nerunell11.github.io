ミキサは最大 64 ボイスを合成します。各ボイスに音量とパンがあり、再生・停止・音量変更は固定長コマンドキューを介してメインスレッドからオーディオスレッドへ渡します。

### パンとミックス

パンを -1〜1 に制限し、角度に変換して左右のゲインを計算します。オーディオスレッドはコマンドを取り出し、有効なボイスを混ぜて出力を制限します。

```math
\theta=(\operatorname{clamp}(p,-1,1)+1)\frac{\pi}{4},\quad
g_L=V\cos\theta,\quad g_R=V\sin\theta
```

`$p$` はパン、`$V$` は音量、`$g_L,g_R$` は左右のゲインです。

```cpp
// Engine/Audio/Src/AudioMixer.cpp
    void AudioMixer::UpdateGains(Voice& voice)
    {
        const f32 pan = Clamp(voice.pan, -1.0f, 1.0f);
        const f32 angle = (pan + 1.0f) * (kPi * 0.25f);
        voice.leftGain = std::cos(angle) * voice.volume;
        voice.rightGain = std::sin(angle) * voice.volume;
    }
```

WAV は PCM 16/24 bit と IMA ADPCM を読めます。ローパス・ハイパスフィルタとフィードバックディレイは別クラスとしてありますが、ミキサ内で呼ぶ処理はまだなく、バスの階層もありません。Sandbox はミキサを使用します。
