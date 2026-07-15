import { eq } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { Task, type TaskStatus } from '../../domain/Task';
import type { TaskRepository } from '../../domain/repository/TaskRepository';
import { tasks } from '../db/schema';

export class DrizzleTaskRepository implements TaskRepository {
    constructor(private readonly db: DrizzleD1Database) {}

    async findAll(): Promise<Task[]> {
        const rows = await this.db.select().from(tasks).all();

        return rows.map(
            (row) =>
                new Task({
                    id: row.id,
                    title: row.title,
                    description: row.description,
                    status: row.status,
                    createdAt: row.createdAt,
                    updatedAt: row.updatedAt,
                })
        );
    }

    async create(task: Task): Promise<void> {
        await this.db.insert(tasks).values({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        });
    }

    async findById(id: string): Promise<Task | null> {
        const row = await this.db
            .select()
            .from(tasks)
            .where(eq(tasks.id, id))
            .get();

        if (!row) {
            return null;
        }

        return new Task({
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        });
    }

    async updateStatus(
        id: string,
        status: TaskStatus,
        updatedAt: string
    ): Promise<void> {
        await this.db
            .update(tasks)
            .set({
                status,
                updatedAt,
            })
            .where(eq(tasks.id, id));
    }
}
