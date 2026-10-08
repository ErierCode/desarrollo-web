import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/api-exception.filter";
import { validationExceptionFactory } from "./common/validation-exception.factory";
import { API_PORT, FRONTEND_ORIGIN } from "./config";

async function bootstrap(): Promise<void> {
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
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle("Tareas")
    .setDescription(
      "API HTTP de demostración. Los datos viven en memoria y se reinician al detener el proceso. " +
        "PUT reemplaza el recurso completo; PATCH solo modifica los campos enviados.",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Tareas API · OpenAPI",
  });

  await app.listen(API_PORT);
  console.log(`API en http://localhost:${API_PORT}`);
  console.log(`OpenAPI en http://localhost:${API_PORT}/docs`);
}

void bootstrap().catch((error: unknown) => {
  console.error("No se pudo iniciar la API", error);
  process.exit(1);
});
