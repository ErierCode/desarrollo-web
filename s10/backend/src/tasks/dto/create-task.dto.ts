import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsString, MaxLength, MinLength, ValidateIf } from "class-validator";
import { TaskPriority, TaskStatus } from "../task.enums";
import { IsCalendarDate } from "./is-calendar-date";

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

export class CreateTaskDto {
  @ApiProperty({ example: "Revisar el contrato HTTP", minLength: 3, maxLength: 80 })
  @Transform(trimString)
  @IsString({ message: "El título debe ser texto" })
  @MinLength(3, { message: "El título debe tener al menos 3 caracteres" })
  @MaxLength(80, { message: "El título no puede superar 80 caracteres" })
  title!: string;

  @ApiPropertyOptional({
    example: "Comprobar los códigos 201, 400 y 409.",
    maxLength: 500,
  })
  @Transform(trimString)
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: "La descripción debe ser texto" })
  @MaxLength(500, { message: "La descripción no puede superar 500 caracteres" })
  description?: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.Media })
  @IsEnum(TaskPriority, { message: "La prioridad debe ser baja, media o alta" })
  priority!: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.Pendiente })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(TaskStatus, {
    message: "El estado debe ser pendiente, en_curso o hecha",
  })
  status?: TaskStatus;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: "2026-10-20",
    description: "Fecha límite AAAA-MM-DD. null u omisión dejan la fecha vacía.",
  })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsCalendarDate({
    message: "La fecha límite debe ser un día real con formato AAAA-MM-DD",
  })
  dueDate?: string | null;
}
