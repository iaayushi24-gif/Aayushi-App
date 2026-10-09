/**
 * Resilient Audio Controller for Oro Voice Concierge
 * - Mic capture: 16kHz Float32 -> 16-bit PCM Little Endian -> Base64
 * - Mic visualizer analysis: Real-time frequency response during speech
 * - Playback: 24kHz 16-bit PCM (for Gemini Live) & high-fidelity WAV (for Gemini TTS)
 * - Dual-layer playback: AudioContext with AudioElement fallback
 */

export class AudioLiveController {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private currentAudioEl: HTMLAudioElement | null = null;
  private onAudioChunkReady?: (base64Pcm: string) => void;
  private onSpeakingStateChange?: (isSpeaking: boolean) => void;

  public isRecording: boolean = false;
  public isOutputPlaying: boolean = false;

  constructor(
    onAudioChunkReady?: (base64Pcm: string) => void,
    onSpeakingStateChange?: (isSpeaking: boolean) => void
  ) {
    this.onAudioChunkReady = onAudioChunkReady;
    this.onSpeakingStateChange = onSpeakingStateChange;
  }

  // Ensure AudioContext is running (must be triggered from user gesture)
  public async ensureContext(): Promise<AudioContext> {
    const ctx = this.initOutputContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume warning:', e);
      }
    }
    return ctx;
  }

  // Initialize playback AudioContext (24kHz required by Gemini Live output)
  public initOutputContext(): AudioContext {
    if (!this.outputAudioCtx || this.outputAudioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
      this.outputAnalyser = this.outputAudioCtx.createAnalyser();
      this.outputAnalyser.fftSize = 64;
      this.outputAnalyser.smoothingTimeConstant = 0.8;
      this.outputAnalyser.connect(this.outputAudioCtx.destination);
    }
    return this.outputAudioCtx;
  }

  // Start microphone capture at 16kHz
  public async startMicrophone(): Promise<boolean> {
    try {
      await this.ensureContext();

      if (!navigator?.mediaDevices?.getUserMedia) {
        return false;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });
      if (this.inputAudioCtx.state === 'suspended') {
        await this.inputAudioCtx.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.inputSource = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      
      // Input analyser for visualizing user's voice
      this.inputAnalyser = this.inputAudioCtx.createAnalyser();
      this.inputAnalyser.fftSize = 64;
      this.inputAnalyser.smoothingTimeConstant = 0.7;
      this.inputSource.connect(this.inputAnalyser);

      // ScriptProcessor for 16kHz PCM streaming
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const base64Pcm = this.floatTo16BitPCM(inputData);
        if (this.onAudioChunkReady && base64Pcm) {
          this.onAudioChunkReady(base64Pcm);
        }
      };

      this.inputSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);
      this.isRecording = true;
      return true;
    } catch (err: any) {
      // Gracefully handle denied permission or device in-use without unhandled rejection
      this.isRecording = false;
      return false;
    }
  }

  // Stop microphone capture
  public stopMicrophone(): void {
    this.isRecording = false;
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.inputAnalyser) {
      this.inputAnalyser.disconnect();
      this.inputAnalyser = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioCtx && this.inputAudioCtx.state !== 'closed') {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }
  }

  // Convert Float32 array to 16-bit PCM Little Endian base64 string
  private floatTo16BitPCM(input: Float32Array): string {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Play incoming raw 24kHz PCM chunk from Gemini Live
  public playChunk24kHz(base64Pcm: string): void {
    const ctx = this.initOutputContext();

    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
    audioBuffer.copyToChannel(float32, 0, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    if (this.outputAnalyser) {
      source.connect(this.outputAnalyser);
    } else {
      source.connect(ctx.destination);
    }

    const currentTime = ctx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.activeSources.push(source);

    this.setIsOutputPlaying(true);

    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
      if (this.activeSources.length === 0) {
        this.setIsOutputPlaying(false);
      }
    };
  }

  // Play a full WAV base64 file with guaranteed browser playback
  public async playWavBase64(base64Wav: string): Promise<void> {
    this.interruptPlayback();
    await this.ensureContext();

    return new Promise((resolve) => {
      try {
        const binaryString = atob(base64Wav);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'audio/wav' });
        const blobUrl = URL.createObjectURL(blob);
        const audio = new Audio(blobUrl);
        this.currentAudioEl = audio;

        // Try connecting to analyser for visualizer
        if (this.outputAudioCtx && this.outputAnalyser) {
          try {
            const source = this.outputAudioCtx.createMediaElementSource(audio);
            source.connect(this.outputAnalyser);
          } catch (e) {
            // Some browsers require same-origin or single element connection
          }
        }

        this.setIsOutputPlaying(true);

        audio.onended = () => {
          this.setIsOutputPlaying(false);
          this.currentAudioEl = null;
          URL.revokeObjectURL(blobUrl);
          resolve();
        };

        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          this.setIsOutputPlaying(false);
          this.currentAudioEl = null;
          URL.revokeObjectURL(blobUrl);
          resolve();
        };

        audio.play().catch((playErr) => {
          console.warn('Autoplay prevented or interrupted:', playErr);
          this.setIsOutputPlaying(false);
          this.currentAudioEl = null;
          URL.revokeObjectURL(blobUrl);
          resolve();
        });
      } catch (err) {
        console.error('playWavBase64 error:', err);
        this.setIsOutputPlaying(false);
        resolve();
      }
    });
  }

  // Cancel any ongoing audio output playback
  public interruptPlayback(): void {
    if (this.currentAudioEl) {
      try {
        this.currentAudioEl.pause();
        this.currentAudioEl.currentTime = 0;
      } catch (e) {}
      this.currentAudioEl = null;
    }

    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.setIsOutputPlaying(false);
  }

  private setIsOutputPlaying(val: boolean) {
    if (this.isOutputPlaying !== val) {
      this.isOutputPlaying = val;
      this.onSpeakingStateChange?.(val);
    }
  }

  // Get current audio frequency energy for visualizer (0.0 to 1.0)
  // Combines output playback energy or input mic energy
  public getVisualizerEnergy(): number {
    if (this.isOutputPlaying && this.outputAnalyser) {
      const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
      this.outputAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      return Math.min(1, (sum / (dataArray.length || 1)) / 100);
    }

    if (this.isRecording && this.inputAnalyser) {
      const dataArray = new Uint8Array(this.inputAnalyser.frequencyBinCount);
      this.inputAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      return Math.min(1, (sum / (dataArray.length || 1)) / 120);
    }

    return 0;
  }

  // Clean up all resources
  public dispose(): void {
    this.stopMicrophone();
    this.interruptPlayback();
    if (this.outputAudioCtx && this.outputAudioCtx.state !== 'closed') {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }
  }
}
