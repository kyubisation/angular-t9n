import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import type WebSocket from 'ws';

import { TargetInfo } from '../target-info';

@WebSocketGateway()
export class ProjectGateway implements OnGatewayConnection {
  constructor(private _targetInfo: TargetInfo) {}

  handleConnection(client: WebSocket) {
    client.send(JSON.stringify(this._targetInfo));
  }
}
