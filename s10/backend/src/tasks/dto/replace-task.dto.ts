import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { TaskPriority, TaskStatus } from "../task.enums";
import { IsCalendarDate } from "./is-calendar-date";

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

export class ReplaceTaskDto {
  @ApiProperty({ minLength: 3, maxLength: 80, example: "Cerrar la demostración" })
  @Transform(trimString)
  @IsString({ message: "El título debe ser texto" })
  @MinLength(3, { message: "El título debe tener al menos 3 caracteres" })
  @MaxLength(80, { message: "El título no puede superar 80 caracteres" })
  title!: string;

  @ApiProperty({
    maxLength: 500,
    example: "Representación completa de la tarea.",
    description: "Obligatoria en PUT. Una cadena vacía deja la descripción en blanco.",
  })
  @Transform(trimString)
  @IsString({ message: "La descripción debe ser texto" })
  @MaxLength(500, { message: "La descripción no puede superar 500 caracteres" })
  description!: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.Alta })
  @IsEnum(TaskPriority, { message: "La prioridad debe ser baja, media o alta" })
  priority!: TaskPriority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.Hecha })
  @IsEnum(TaskStatus, {
    message: "El estado debe ser pendiente, en_curso o hecha",
  })
  status!: TaskStatus;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: "2026-10-31",
    description:
      "Si se omite o es null, el reemplazo deja la fecha límite vacía. PUT no conserva el valor anterior.",
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsCalendarDate({
    message: "La fecha límite debe ser un día real con formato AAAA-MM-DD",
  })
  dueDate?: string | null;
}
