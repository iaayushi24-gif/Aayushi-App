/**
 * Browser Speech Recognition & Audio Input Service
 * Handles browser microphone voice recognition (SpeechRecognition / webkitSpeechRecognition)
 * with graceful fallback to MediaStream audio recording.
 */

export interface SpeechListenerOptions {
  language: 'en' | 'fr';
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  public isListening: boolean = false;
  private currentLanguage: 'en' | 'fr' = 'en';

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public start(options: SpeechListenerOptions): boolean {
    if (!this.recognition) {
      options.onError('Speech recognition is not supported in this browser. You can type or use soundboard prompts.');
      return false;
    }

    try {
      this.currentLanguage = options.language;
      this.recognition.lang = options.language === 'fr' ? 'fr-FR' : 'en-GB';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          options.onInterim(interimTranscript);
        }
        if (finalTranscript) {
          options.onFinal(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.warn('Speech recognition error event:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          options.onError(`Microphone note: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      options.onError(err?.message || 'Could not access speech recognition');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  public abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
      this.isListening = false;
    }
  }
}
