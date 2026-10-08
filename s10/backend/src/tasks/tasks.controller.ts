import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateTaskDto } from "./dto/create-task.dto";
import { ReplaceTaskDto } from "./dto/replace-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { Task } from "./task.entity";
import { TasksService } from "./tasks.service";

const taskIdPipe = new ParseUUIDPipe({
  version: "4",
  exceptionFactory: () => new BadRequestException("El id debe ser un UUID v4"),
});

const idParam = ApiParam({
  name: "id",
  format: "uuid",
  description: "Identificador UUID v4 de la tarea",
});

@ApiTags("tareas")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Listar tareas" })
  @ApiOkResponse({ type: Task, isArray: true })
  findAll(): Task[] {
    return this.tasksService.findAll();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @idParam
  @ApiOperation({ summary: "Obtener una tarea" })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse({ description: "El id no es un UUID v4" })
  @ApiNotFoundResponse({ description: "No existe una tarea con ese id" })
  findOne(@Param("id", taskIdPipe) id: string): Task {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Crear una tarea",
    description:
      "El servidor asigna id, createdAt y updatedAt. Si se omite el estado, la tarea queda pendiente. Un título ya usado responde 409.",
  })
  @ApiCreatedResponse({ type: Task })
  @ApiBadRequestResponse({
    description: "Datos inválidos, tipos incorrectos o propiedades no permitidas",
  })
  @ApiConflictResponse({ description: "Ya existe una tarea con el mismo título" })
  create(@Body() dto: CreateTaskDto): Task {
    return this.tasksService.create(dto);
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @idParam
  @ApiOperation({
    summary: "Actualizar parcialmente una tarea",
    description:
      "Solo cambian los campos enviados. Un cuerpo vacío, o sin campos reconocidos, responde 400.",
  })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse({ description: "Cuerpo vacío, id inválido o datos inválidos" })
  @ApiNotFoundResponse({ description: "No existe una tarea con ese id" })
  @ApiConflictResponse({ description: "El título nuevo ya pertenece a otra tarea" })
  update(@Param("id", taskIdPipe) id: string, @Body() dto: UpdateTaskDto): Task {
    return this.tasksService.update(id, dto);
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @idParam
  @ApiOperation({
    summary: "Reemplazar una tarea",
    description:
      "PUT sustituye la representación completa. title, description, priority y status son obligatorios. Si dueDate se omite, queda null: no se conserva el valor anterior. id y createdAt los mantiene el servidor.",
  })
  @ApiOkResponse({ type: Task, description: "Recurso reemplazado" })
  @ApiBadRequestResponse({
    description: "Falta un campo obligatorio, el id es inválido o hay propiedades no permitidas",
  })
  @ApiNotFoundResponse({ description: "No existe una tarea con ese id" })
  @ApiConflictResponse({ description: "El título ya pertenece a otra tarea" })
  replace(@Param("id", taskIdPipe) id: string, @Body() dto: ReplaceTaskDto): Task {
    return this.tasksService.replace(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @idParam
  @ApiOperation({ summary: "Eliminar una tarea" })
  @ApiNoContentResponse({ description: "Eliminada. La respuesta no tiene cuerpo." })
  @ApiBadRequestResponse({ description: "El id no es un UUID v4" })
  @ApiNotFoundResponse({ description: "No existe una tarea con ese id" })
  remove(@Param("id", taskIdPipe) id: string): void {
    this.tasksService.remove(id);
  }
}
