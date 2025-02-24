import { Injectable, NgZone } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  fromEvent,
  interval,
  merge,
} from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AutomationService {
  private isActive = new BehaviorSubject<boolean>(false);
  private stopAutomation = new Subject<void>();
  private typingSubscription: Subscription | null = null;
  private mouseSubscription: Subscription | null = null;
  private keyPressSubscription: Subscription | null = null;

  // Lista de palabras para generar texto aleatorio
  private wordList: string[] = [
    'angular',
    'typescript',
    'desarrollo',
    'aplicación',
    'programación',
    'componente',
    'servicio',
    'observable',
    'evento',
    'interfaz',
    'usuario',
    'automatización',
    'javascript',
    'frontend',
    'web',
    'proyecto',
    'rxjs',
    'asíncrono',
    'reactivo',
    'módulo',
  ];

  constructor(private ngZone: NgZone) {}

  // Retorna un Observable del estado actual
  getActiveState(): Observable<boolean> {
    return this.isActive.asObservable();
  }

  // Activa la automatización
  activate(textArea: HTMLTextAreaElement): void {
    if (this.isActive.value) return;

    this.isActive.next(true);
    this.setupKeyboardShortcut();
    this.startTextGeneration(textArea);
    this.lockMouseToElement(textArea);
  }

  // Desactiva la automatización
  deactivate(): void {
    if (!this.isActive.value) return;

    this.isActive.next(false);
    this.stopAutomation.next();

    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = null;
    }

    if (this.mouseSubscription) {
      this.mouseSubscription.unsubscribe();
      this.mouseSubscription = null;
    }

    if (this.keyPressSubscription) {
      this.keyPressSubscription.unsubscribe();
      this.keyPressSubscription = null;
    }

    // Restaurar el comportamiento normal del cursor
    document.exitPointerLock();
  }

  // Inicia la generación de texto automática
  private startTextGeneration(textArea: HTMLTextAreaElement): void {
    this.ngZone.runOutsideAngular(() => {
      this.typingSubscription = interval(100 + Math.random() * 150)
        .pipe(takeUntil(this.stopAutomation))
        .subscribe(() => {
          this.ngZone.run(() => {
            // Generar texto aleatorio
            const currentText = textArea.value;
            const maxLength = textArea.maxLength || 500;

            if (currentText.length >= maxLength) {
              // Limpiar el texto cuando se alcanza el límite
              textArea.value = '';
            } else {
              // Añadir un carácter o una palabra
              if (Math.random() > 0.8) {
                // Añadir una palabra completa ocasionalmente
                const randomWord = this.getRandomWord();
                if (currentText.length + randomWord.length + 1 <= maxLength) {
                  textArea.value =
                    currentText +
                    (currentText.endsWith(' ') ? '' : ' ') +
                    randomWord;
                }
              } else {
                // Añadir un carácter
                const randomChar = this.getRandomChar();
                textArea.value = currentText + randomChar;
              }
            }

            // Actualizar el foco y la posición del cursor
            textArea.focus();
            textArea.setSelectionRange(
              textArea.value.length,
              textArea.value.length
            );
          });
        });
    });
  }

  // Bloquea el mouse dentro del área de texto
  private lockMouseToElement(element: HTMLElement): void {
    element.requestPointerLock();

    this.ngZone.runOutsideAngular(() => {
      this.mouseSubscription = interval(500 + Math.random() * 1000)
        .pipe(takeUntil(this.stopAutomation))
        .subscribe(() => {
          this.ngZone.run(() => {
            // Verificar si el puntero está bloqueado, si no, bloquearlo de nuevo
            if (document.pointerLockElement !== element) {
              element.requestPointerLock();
            }

            // Mover el cursor aleatoriamente (esto no afecta realmente la posición visual
            // del cursor, pero simula movimiento mientras está bloqueado)
            const randomX = Math.floor(Math.random() * 50) - 25;
            const randomY = Math.floor(Math.random() * 50) - 25;

            // Dispatch un evento de movimiento del mouse
            const mouseEvent = new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              clientX: randomX,
              clientY: randomY,
              movementX: randomX,
              movementY: randomY,
            });

            element.dispatchEvent(mouseEvent);
          });
        });
    });
  }

  // Configura el atajo de teclado para desactivar
  private setupKeyboardShortcut(): void {
    this.ngZone.runOutsideAngular(() => {
      const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');

      // Ctrl + Shift + X para desactivar
      this.keyPressSubscription = keydown$
        .pipe(
          filter(
            (event) => event.ctrlKey && event.shiftKey && event.key === 'X'
          ),
          takeUntil(this.stopAutomation),
          take(1)
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            this.deactivate();
          });
        });
    });
  }

  // Genera un carácter aleatorio
  private getRandomChar(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:!? ';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Obtiene una palabra aleatoria de la lista
  private getRandomWord(): string {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }
}
