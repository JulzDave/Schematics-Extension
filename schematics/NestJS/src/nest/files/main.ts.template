/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as csurf from 'csurf';

import { start as startAPM } from 'elastic-apm-node';

const PLUGIN_NAME = '<%= pluginName %>';
const TLS_ACRONYM = 'tls';
const TLS_VERSION = 'TLSv1';
const NODE_TLS_REJECT_UNAUTHORIZED = 'NODE_TLS_REJECT_UNAUTHORIZED';
const APM_SERVER_URL = 'http://slpelastic-apm01:8200'; // TODO: Place inside a dedicated ENV file.
const ZERO_STRING_LITERAL = '0';
const API_STRING_LITERAL_UPPERCASED = 'API';
const PLACEHOLDER_STRING_LITERAL = 'placeholder'; // TODO: For the Programmer: Address the placeholders and provide content.
const SWAGGER_VERSION = '1.0.0';

async function bootstrap() {
    startAPM({
        serviceName: PLUGIN_NAME,
        serverUrl: APM_SERVER_URL,
    });
    require(TLS_ACRONYM).DEFAULT_MIN_VERSION = TLS_VERSION; // Allows work with WMB's SSL protocol.
    process.env[NODE_TLS_REJECT_UNAUTHORIZED] = ZERO_STRING_LITERAL; // Allows work with WMB's SSL protocol.
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.use(csurf());
    app.use(compression());
    const globalPrefix = PLUGIN_NAME;
    app.setGlobalPrefix(globalPrefix);
    app.enableCors();
    const swaggerOptions = new DocumentBuilder()
        .setTitle(`${PLUGIN_NAME} ${API_STRING_LITERAL_UPPERCASED}`)
        .setDescription(
            `${PLUGIN_NAME} ${API_STRING_LITERAL_UPPERCASED} ${PLACEHOLDER_STRING_LITERAL}`,
        )
        .setVersion(SWAGGER_VERSION)
        .build();
    const document = SwaggerModule.createDocument(app, swaggerOptions, {
        ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup(
        API_STRING_LITERAL_UPPERCASED.toLowerCase(),
        app,
        document,
    );
    const port = process.env.PORT || 3333;
    await app.listen(port, () => {
        Logger.log(
            'Listening at http://localhost:' + port + '/' + globalPrefix,
        );
    });
}
bootstrap();
