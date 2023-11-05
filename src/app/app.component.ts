import { Component, HostBinding } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSnackBar,
  MatSnackBarModule,
  MatSnackBarRef,
  SimpleSnackBar,
} from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';

import { WebsocketService } from './core/websocket.service';

@Component({
  selector: 't9n-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterOutlet,
  ],
})
export class AppComponent {
  @HostBinding('class.service-down') serviceDown = false;

  constructor(websocketService: WebsocketService, snackbar: MatSnackBar) {
    let snackbarRef: MatSnackBarRef<SimpleSnackBar>;
    websocketService.project.subscribe((p) => {
      if (!this.serviceDown && !p) {
        snackbarRef = snackbar.open(
          `Translation server is not available. Start it by running the command 'ng run yourProject:t9n' in your console.`,
        );
      } else if (this.serviceDown && p) {
        snackbarRef?.dismiss();
      }

      this.serviceDown = !p;
    });
  }
}
