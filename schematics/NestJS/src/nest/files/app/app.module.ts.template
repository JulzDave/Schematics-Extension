import { Module, HttpModule } from '@nestjs/common';

import { HealthController } from './health-check/health.controller';
import { HealthService } from './health-check/health.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: <%= parseInt(timeoutDelta) * 1000 %>,
            maxRedirects: 5,
        }),
    ],
    controllers: [HealthController],
    providers: [HealthService],
})
export class AppModule {}
