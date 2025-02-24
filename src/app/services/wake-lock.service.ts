import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class WakeLockService {
  private wakeLock: any = null;
  private isWakeLockEnabled = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  constructor(private ngZone: NgZone, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getWakeLockStatus(): Observable<boolean> {
    return this.isWakeLockEnabled.asObservable();
  }

  async requestWakeLock(): Promise<boolean> {
    if (!this.isBrowser) return false;

    try {
      // Verificar si la API está disponible
      if ('wakeLock' in navigator) {
        // Solicitar un screen wake lock
        this.wakeLock = await (navigator as any).wakeLock.request('screen');

        this.wakeLock.addEventListener('release', () => {
          this.ngZone.run(() => {
            console.log('Wake Lock fue liberado');
            this.isWakeLockEnabled.next(false);
          });
        });

        console.log('Wake Lock activado');
        this.isWakeLockEnabled.next(true);
        return true;
      } else {
        console.warn('Wake Lock API no está disponible en este navegador');
        // Usaremos métodos alternativos
        this.useAlternativeMethods();
        return false;
      }
    } catch (err) {
      console.error(`Error al activar Wake Lock: ${err}`);
      // Usar métodos alternativos si la API falla
      this.useAlternativeMethods();
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (!this.isBrowser) return;

    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.error(`Error al liberar Wake Lock: ${err}`);
      }
    }

    // Detener también los métodos alternativos
    this.stopAlternativeMethods();
    this.isWakeLockEnabled.next(false);
  }

  // Variables para métodos alternativos
  private videoElement: HTMLVideoElement | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private activityInterval: any = null;

  private useAlternativeMethods(): void {
    // Método 1: Reproducir video silencioso en bucle (mantiene la pantalla activa)
    if (!this.videoElement) {
      this.videoElement = document.createElement('video');
      this.videoElement.setAttribute('loop', '');
      this.videoElement.setAttribute('playsinline', '');
      this.videoElement.setAttribute('muted', '');
      this.videoElement.setAttribute('width', '1');
      this.videoElement.setAttribute('height', '1');
      this.videoElement.style.position = 'absolute';
      this.videoElement.style.opacity = '0.01';
      this.videoElement.style.pointerEvents = 'none';

      // Crear una fuente de video con un pixel en blanco
      const videoSource = document.createElement('source');
      // URL de un video mínimo (puedes usar un asset local)
      videoSource.setAttribute(
        'src',
        'data:video/mp4;base64,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'
      );
      videoSource.setAttribute('type', 'video/mp4');
      this.videoElement.appendChild(videoSource);

      document.body.appendChild(this.videoElement);
      this.videoElement
        .play()
        .catch((e) => console.error('Error al reproducir video:', e));
    }

    // Método 2: Actividad periódica para simular interacción
    if (!this.activityInterval) {
      this.activityInterval = setInterval(() => {
        // Simular movimiento del ratón
        const event = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: Math.floor(Math.random() * window.innerWidth),
          clientY: Math.floor(Math.random() * window.innerHeight),
        });
        document.dispatchEvent(event);

        // También podemos enviar eventos de teclado inofensivos
        const keyEvent = new KeyboardEvent('keydown', {
          key: 'F15', // Tecla que no debería tener efecto visible
          code: 'F15',
          bubbles: true,
          cancelable: true,
        });
        document.dispatchEvent(keyEvent);
      }, 60000); // Cada minuto
    }

    // Método 3: Audio silencioso (funciona en algunos sistemas para mantener activo)
    if (!this.audioElement) {
      this.audioElement = document.createElement('audio');
      this.audioElement.setAttribute('loop', '');
      this.audioElement.setAttribute('muted', '');
      this.audioElement.volume = 0.01; // Casi silencioso, pero no del todo

      // Crear una fuente de audio con un tono de muy baja frecuencia
      const audioSource = document.createElement('source');
      // URL de un audio mínimo (puedes usar un asset local)
      audioSource.setAttribute(
        'src',
        'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//uQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAYAAAAAAAAAASDs4UTIAAAAAAAAAAAAAAAA//uQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
      );
      audioSource.setAttribute('type', 'audio/mpeg');
      this.audioElement.appendChild(audioSource);

      document.body.appendChild(this.audioElement);
      this.audioElement
        .play()
        .catch((e) => console.error('Error al reproducir audio:', e));
    }

    this.isWakeLockEnabled.next(true);
  }

  private stopAlternativeMethods(): void {
    // Detener video si existe
    if (this.videoElement) {
      this.videoElement.pause();
      if (this.videoElement.parentNode) {
        this.videoElement.parentNode.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }

    // Detener audio si existe
    if (this.audioElement) {
      this.audioElement.pause();
      if (this.audioElement.parentNode) {
        this.audioElement.parentNode.removeChild(this.audioElement);
      }
      this.audioElement = null;
    }

    // Detener intervalo de actividad
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }
}
