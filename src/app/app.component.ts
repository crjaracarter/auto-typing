import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AutoTyperComponent } from './components/auto-typer/auto-typer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AutoTyperComponent],
  template: `
    <div class="app-container">
      <app-auto-typer></app-auto-typer>
    </div>
  `,
  styles: [
    `
      .app-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
    `,
  ],
})
export class AppComponent {}
