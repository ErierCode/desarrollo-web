import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { validationExceptionFactory } from "./common/validation-exception.factory";
import { API_PORT, FRONTEND_ORIGIN } from "./config";
import { db } from "./db/client";
import { seedIfEmpty } from "./db/seed";

async function bootstrap(): Promise<void> {
  await seedIfEmpty(db);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Accept"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Partidos en vivo")
    .setDescription(
      "API de partidos de fútbol con eventos en tiempo real (SSE) y persistencia PostgreSQL/Drizzle.",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Partidos API · OpenAPI",
  });

  await app.listen(API_PORT);
  console.log(`API en http://localhost:${API_PORT}`);
  console.log(`OpenAPI en http://localhost:${API_PORT}/docs`);
}

void bootstrap().catch((error: unknown) => {
  console.error("No se pudo iniciar la API", error);
  process.exit(1);
});
