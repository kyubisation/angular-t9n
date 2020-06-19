import { Test, TestingModule } from '@nestjs/testing';
import { ProjectGateway } from './project.gateway';

describe('ProjectGateway', () => {
  let gateway: ProjectGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectGateway],
    }).compile();

    gateway = module.get<ProjectGateway>(ProjectGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
