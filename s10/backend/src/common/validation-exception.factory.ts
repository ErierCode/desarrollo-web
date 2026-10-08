import { BadRequestException, type ValidationError } from "@nestjs/common";

export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const messages = flattenValidationErrors(errors);
  return new BadRequestException(
    messages.length > 0 ? messages : ["La petición no es válida"],
  );
}

function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const [key, message] of Object.entries(error.constraints)) {
        const isUnknownProperty =
          key === "whitelistValidation" || message.includes("should not exist");
        messages.push(
          isUnknownProperty
            ? `La propiedad "${error.property}" no está permitida`
            : message,
        );
      }
    }

    if (error.children && error.children.length > 0) {
      messages.push(...flattenValidationErrors(error.children));
    }
  }

  return messages;
}
