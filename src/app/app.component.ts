import { Component, HostBinding } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

import { WebsocketService } from './core/websocket.service';

@Component({
  selector: 't9n-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostBinding('class.service-down') serviceDown = true;

  constructor(websocketService: WebsocketService, snackbar: MatSnackBar) {
    let snackbarRef: MatSnackBarRef<SimpleSnackBar>;
    websocketService.project.subscribe((p) => {
      if (!this.serviceDown && !p) {
        snackbarRef = snackbar.open(
          `Translation server is not available. Start the server in the console with the command 'ng run yourProject:t9n'`,
          undefined,
          { duration: 10000 }
        );
      } else if (this.serviceDown && p) {
        snackbarRef?.dismiss();
      }

      this.serviceDown = !p;
    });
  }
}
