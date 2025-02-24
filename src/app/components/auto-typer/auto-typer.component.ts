// auto-typer.component.ts
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationService } from '../../services/automation.service';
import { WakeLockService } from '../../services/wake-lock.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auto-typer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-typer.component.html',
  styleUrls: ['./auto-typer.component.scss'],
})
export class AutoTyperComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true })
  textArea!: ElementRef<HTMLTextAreaElement>;

  isActive = false;
  isWakeLockActive = false;
  private stateSubscription: Subscription | null = null;
  private wakeLockSubscription: Subscription | null = null;

  constructor(
    private automationService: AutomationService,
    private wakeLockService: WakeLockService
  ) {}

  ngOnInit(): void {
    this.stateSubscription = this.automationService
      .getActiveState()
      .subscribe((state) => {
        this.isActive = state;
        if (state) {
          this.activateWakeLock();
        } else {
          this.deactivateWakeLock();
        }
      });

    this.wakeLockSubscription = this.wakeLockService
      .getWakeLockStatus()
      .subscribe((status) => (this.isWakeLockActive = status));
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }

    if (this.wakeLockSubscription) {
      this.wakeLockSubscription.unsubscribe();
    }

    this.automationService.deactivate();
    this.deactivateWakeLock();
  }

  toggleAutomation(): void {
    if (this.isActive) {
      this.automationService.deactivate();
    } else {
      this.automationService.activate(this.textArea.nativeElement);
    }
  }

  private async activateWakeLock(): Promise<void> {
    await this.wakeLockService.requestWakeLock();
  }

  private async deactivateWakeLock(): Promise<void> {
    await this.wakeLockService.releaseWakeLock();
  }
}
