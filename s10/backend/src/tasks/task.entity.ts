import { ApiProperty } from "@nestjs/swagger";
import { TaskPriority, TaskStatus } from "./task.enums";

export class Task {
  @ApiProperty({
    format: "uuid",
    example: "6f0c9a2e-1b7d-4c3a-8e91-0a5b2c7d4e18",
  })
  id!: string;

  @ApiProperty({ example: "Preparar la demostración", minLength: 3, maxLength: 80 })
  title!: string;

  @ApiProperty({
    example: "Recorrer el alta, la validación y el conflicto de título.",
    maxLength: 500,
  })
  description!: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.Alta })
  priority!: TaskPriority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.EnCurso })
  status!: TaskStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    example: "2026-10-15",
    description: "Fecha límite AAAA-MM-DD, o null si no tiene.",
  })
  dueDate!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ format: "date-time" })
  updatedAt!: string;
}
