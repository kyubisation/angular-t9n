import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type WebSocket from 'ws';

import { TargetInfo } from '../target-info';

import { ProjectGateway } from './project.gateway';

describe('ProjectGateway', () => {
  it('should emit target info on connecting', () => {
    const info = new TargetInfo('test', 'file', 'en');
    const gateway = new ProjectGateway(info);
    let sentValue: any;
    const ws: Partial<WebSocket> = {
      send(value: any) {
        sentValue = value;
      },
    };
    gateway.handleConnection(ws as WebSocket);
    const expected = JSON.stringify(info);
    assert.equal(sentValue, expected);
  });
});
