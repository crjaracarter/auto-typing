import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutomationService } from '../../services/automation.service';
import { Subscription } from 'rxjs';
import { PointerLockDirective } from '../../directives/pointer-lock.directive';

@Component({
  selector: 'app-auto-typer',
  standalone: true,
  imports: [CommonModule, PointerLockDirective],
  templateUrl: './auto-typer.component.html',
  styleUrls: ['./auto-typer.component.scss'],
})
export class AutoTyperComponent implements OnInit, OnDestroy {
  @ViewChild('textArea', { static: true })
  textArea!: ElementRef<HTMLTextAreaElement>;

  isActive = false;
  private stateSubscription: Subscription | null = null;

  constructor(private automationService: AutomationService) {}

  ngOnInit(): void {
    this.stateSubscription = this.automationService
      .getActiveState()
      .subscribe((state) => (this.isActive = state));
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.automationService.deactivate();
  }

  toggleAutomation(): void {
    if (this.isActive) {
      this.automationService.deactivate();
    } else {
      this.automationService.activate(this.textArea.nativeElement);
    }
  }
}
