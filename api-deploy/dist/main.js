"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    });
    app.setGlobalPrefix('api');
    // Middleware to add deployment version header
    app.use((req, res, next) => { res.set('X-Deploy', 'v3'); next(); });
    await app.listen(process.env.PORT || 4000);
    console.log(`YieldGuard API running on port ${process.env.PORT || 4000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map