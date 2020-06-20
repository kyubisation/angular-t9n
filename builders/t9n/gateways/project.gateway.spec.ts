import { Test, TestingModule } from '@nestjs/testing';
import type WebSocket from 'ws';

import { TargetInfo } from '../target-info';

import { ProjectGateway } from './project.gateway';

describe('ProjectGateway', () => {
  let gateway: ProjectGateway;
  const info = new TargetInfo('test', 'file', 'en');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectGateway, { provide: TargetInfo, useValue: info }],
    }).compile();

    gateway = module.get<ProjectGateway>(ProjectGateway);
  });

  it('should emit target info on connecting', () => {
    let sentValue: any;
    const ws: Partial<WebSocket> = {
      send(value: any) {
        sentValue = value;
      },
    };
    gateway.handleConnection(ws as WebSocket);
    expect(sentValue).toEqual(JSON.stringify(info));
  });
});
