import { registerDecorator, type ValidationOptions } from "class-validator";

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isCalendarDate(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const match = CALENDAR_DATE.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function IsCalendarDate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: "isCalendarDate",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isCalendarDate(value),
      },
    });
  };
}
