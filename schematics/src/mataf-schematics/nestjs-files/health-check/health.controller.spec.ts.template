import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [HealthService],
        }).compile();
    });

    describe('healthCheck', () => {
        it('should return "OK"', () => {
            const healthController = app.get<HealthController>(
                HealthController,
            );
            expect(healthController.healthCheck()).toEqual({
                message: 'OK',
            });
        });
    });
});
