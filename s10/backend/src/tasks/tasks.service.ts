import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { CreateTaskDto } from "./dto/create-task.dto";
import type { ReplaceTaskDto } from "./dto/replace-task.dto";
import type { UpdateTaskDto } from "./dto/update-task.dto";
import { Task } from "./task.entity";
import { TaskPriority, TaskStatus } from "./task.enums";

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: "6f0c9a2e-1b7d-4c3a-8e91-0a5b2c7d4e18",
      title: "Preparar la demostración",
      description: "Recorrer el alta, la validación y el conflicto de título.",
      priority: TaskPriority.Alta,
      status: TaskStatus.EnCurso,
      dueDate: "2026-10-15",
      createdAt: "2026-10-07T18:00:00.000Z",
      updatedAt: "2026-10-07T18:00:00.000Z",
    },
    {
      id: "91ab34c0-5d6e-4f70-9a12-b3c4d5e6f708",
      title: "Documentar los códigos HTTP",
      description: "Dejar por escrito cuándo responde 200, 201, 204, 400, 404 y 409.",
      priority: TaskPriority.Media,
      status: TaskStatus.Pendiente,
      dueDate: "2026-10-20",
      createdAt: "2026-10-06T18:00:00.000Z",
      updatedAt: "2026-10-06T18:00:00.000Z",
    },
    {
      id: "c2d4e6f8-0a1b-4c3d-8e5f-60718293a4b5",
      title: "Revisar los DTO",
      description: "Comprobar campos obligatorios, tipos y propiedades desconocidas.",
      priority: TaskPriority.Baja,
      status: TaskStatus.Hecha,
      dueDate: null,
      createdAt: "2026-10-05T18:00:00.000Z",
      updatedAt: "2026-10-05T18:00:00.000Z",
    },
  ];

  findAll(): Task[] {
    return [...this.tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findOne(id: string): Task {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      throw new NotFoundException(`No existe una tarea con id ${id}`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Task {
    this.assertUniqueTitle(dto.title);
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? "",
      priority: dto.priority,
      status: dto.status ?? TaskStatus.Pendiente,
      dueDate: dto.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const current = this.findOne(id);
    if (!this.hasAnyField(dto)) {
      throw new BadRequestException(
        "Debe enviarse al menos un campo para actualizar",
      );
    }
    if (dto.title !== undefined) {
      this.assertUniqueTitle(dto.title, id);
    }

    const updated: Task = {
      ...current,
      title: dto.title ?? current.title,
      description: dto.description ?? current.description,
      priority: dto.priority ?? current.priority,
      status: dto.status ?? current.status,
      dueDate: dto.dueDate === undefined ? current.dueDate : dto.dueDate,
      updatedAt: new Date().toISOString(),
    };
    this.replaceStored(updated);
    return updated;
  }

  replace(id: string, dto: ReplaceTaskDto): Task {
    const current = this.findOne(id);
    this.assertUniqueTitle(dto.title, id);
    const updated: Task = {
      id: current.id,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      dueDate: dto.dueDate ?? null,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.replaceStored(updated);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  private hasAnyField(dto: UpdateTaskDto): boolean {
    return (
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.priority !== undefined ||
      dto.status !== undefined ||
      dto.dueDate !== undefined
    );
  }

  private assertUniqueTitle(title: string, ignoreId?: string): void {
    const normalized = title.toLocaleLowerCase("es");
    const conflict = this.tasks.find(
      (task) =>
        task.id !== ignoreId && task.title.toLocaleLowerCase("es") === normalized,
    );
    if (conflict) {
      throw new ConflictException(`Ya existe una tarea con el título "${title}"`);
    }
  }

  private replaceStored(updated: Task): void {
    this.tasks = this.tasks.map((task) => (task.id === updated.id ? updated : task));
  }
}
