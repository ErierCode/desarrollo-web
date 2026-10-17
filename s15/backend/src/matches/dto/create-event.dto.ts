import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  EVENT_PERIODS,
  EVENT_TEAMS,
  EVENT_TYPES,
  type EventPeriod,
  type EventTeam,
  type EventType,
} from "../match.enums";

export class CreateEventDto {
  @ApiProperty({ enum: EVENT_TYPES })
  @IsIn(EVENT_TYPES, {
    message: `type debe ser uno de: ${EVENT_TYPES.join(", ")}`,
  })
  type!: EventType;

  @ApiProperty({ minimum: 0, maximum: 120 })
  @IsInt({ message: "minute debe ser un entero" })
  @Min(0, { message: "minute no puede ser negativo" })
  @Max(120, { message: "minute no puede superar 120" })
  minute!: number;

  @ApiProperty({ enum: EVENT_TEAMS })
  @IsIn(EVENT_TEAMS, {
    message: `team debe ser uno de: ${EVENT_TEAMS.join(", ")}`,
  })
  team!: EventTeam;

  @ApiProperty({ minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2, { message: "player debe tener al menos 2 caracteres" })
  @MaxLength(80, { message: "player no puede superar 80 caracteres" })
  player!: string;

  @ApiPropertyOptional({ maxLength: 240 })
  @IsOptional()
  @IsString()
  @MaxLength(240, { message: "description no puede superar 240 caracteres" })
  description?: string;

  @ApiPropertyOptional({ enum: EVENT_PERIODS, default: "1H" })
  @IsOptional()
  @IsIn(EVENT_PERIODS, {
    message: `period debe ser uno de: ${EVENT_PERIODS.join(", ")}`,
  })
  period?: EventPeriod;
}
