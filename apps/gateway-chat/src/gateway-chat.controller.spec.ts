import { Test, TestingModule } from '@nestjs/testing';
import { GatewayChatController } from './gateway-chat.controller';
import { GatewayChatService } from './gateway-chat.service';

describe('GatewayChatController', () => {
  let gatewayChatController: GatewayChatController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GatewayChatController],
      providers: [GatewayChatService],
    }).compile();

    gatewayChatController = app.get<GatewayChatController>(GatewayChatController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(gatewayChatController.getHello()).toBe('Hello World!');
    });
  });
});
