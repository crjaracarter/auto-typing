import {
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appPointerLock]',
  standalone: true,
})
export class PointerLockDirective implements OnDestroy {
  @Input() set appPointerLock(value: boolean) {
    if (this.isBrowser) {
      if (value) {
        this.enablePointerLock();
      } else {
        this.disablePointerLock();
      }
    }
  }

  private mouseMoveSubscription: Subscription | null = null;
  private escapeSubscription: Subscription | null = null;
  private isBrowser: boolean;

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.disablePointerLock();
    }
  }

  private enablePointerLock(): void {
    const element = this.el.nativeElement;

    // Solicitar bloqueo del puntero
    element.requestPointerLock();

    // Manejar movimiento aleatorio del mouse
    this.ngZone.runOutsideAngular(() => {
      this.mouseMoveSubscription = fromEvent<MouseEvent>(
        document,
        'mousemove'
      ).subscribe((e: MouseEvent) => {
        // Verificar si seguimos bloqueados
        if (document.pointerLockElement !== element) {
          element.requestPointerLock();
        }
      });

      // Escuchar la tecla Escape (que normalmente libera el puntero)
      this.escapeSubscription = fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(filter((e) => e.key === 'Escape'))
        .subscribe((e) => {
          // Prevenir la acción por defecto de liberar el puntero
          e.preventDefault();
          // Volver a solicitar el bloqueo
          setTimeout(() => element.requestPointerLock(), 50);
        });
    });
  }

  private disablePointerLock(): void {
    if (document.pointerLockElement === this.el.nativeElement) {
      document.exitPointerLock();
    }

    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
      this.mouseMoveSubscription = null;
    }

    if (this.escapeSubscription) {
      this.escapeSubscription.unsubscribe();
      this.escapeSubscription = null;
    }
  }
}
