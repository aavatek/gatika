import { describe, it, expect, beforeEach } from 'vitest';
import { tasks, taskStore, setTaskStore } from './Task';
import { DAY } from '@solid-primitives/date';

describe('Task Module', () => {
	beforeEach(() => {
		setTaskStore([]);
	});

	it('should create a new task to taskStore', () => {
		const newTask = {
			name: 'Test Task',
			start: Date.now(),
			end: Date.now() + DAY,
			id: crypto.randomUUID(),
			created: Date.now(),
			dependencies: [],
		};

		tasks.create(newTask);
		expect(taskStore).toHaveLength(1);
		expect(taskStore[0]).toMatchObject(newTask);
	});

	it('should update an existing task in the taskStore', () => {
		const taskId = crypto.randomUUID();
		const initialTask = {
			name: 'Initial Task',
			start: Date.now(),
			end: Date.now() + DAY,
			id: taskId,
			created: Date.now(),
			dependencies: [],
		};

		tasks.create(initialTask);
		tasks.update(taskId, { name: 'Updated Task' });
		expect(taskStore[0].name).toBe('Updated Task');
	});

	it('should prevent start date earlier than dependencies end date', () => {
		const dependencyId = crypto.randomUUID();
		const dependentTaskId = crypto.randomUUID();

		tasks.create({
			name: 'Dependency Task',
			start: Date.now(),
			end: Date.now() + DAY,
			id: dependencyId,
			created: Date.now(),
			dependencies: [],
		});

		const result = tasks.update(dependentTaskId, {
			start: Date.now() - DAY,
			dependencies: [dependencyId],
		});
		expect(result).toBeInstanceOf(Error);
	});

	it('should delete a task by ID', () => {
		const taskId = crypto.randomUUID();
		tasks.create({
			name: 'Task to Delete',
			start: Date.now(),
			end: Date.now() + DAY,
			id: taskId,
			created: Date.now(),
			dependencies: [],
		});

		tasks.delete(taskId);
		expect(taskStore).toHaveLength(0);
	});

	it('should list tasks by project', () => {
		const projectId = crypto.randomUUID();

		tasks.create({
			name: 'Task 1',
			start: Date.now(),
			end: Date.now() + DAY,
			id: crypto.randomUUID(),
			created: Date.now(),
			project: projectId,
			dependencies: [],
		});

		tasks.create({
			name: 'Task 2',
			start: Date.now(),
			end: Date.now() + DAY * 2,
			id: crypto.randomUUID(),
			created: Date.now(),
			project: projectId,
			dependencies: [],
		});

		const projectTasks = tasks.listByProject(projectId);
		expect(projectTasks).toHaveLength(2);
		expect(projectTasks.every((task) => task.project === projectId)).toBe(true);
	});
});
