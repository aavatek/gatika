import { describe, it, expect, beforeEach } from 'vitest';
import { projects, getColor, setProjectStore, projectStore } from './Project';

describe('Project Module', () => {
	beforeEach(() => {
		setProjectStore([]);
	});

	it('should create a new project in the projectStore', () => {
		const newProject = {
			name: 'Test Project',
			id: crypto.randomUUID(),
			color: getColor(),
			created: Date.now(),
		};

		projects.create(newProject);
		expect(projectStore).toHaveLength(1);
		expect(projectStore[0]).toMatchObject(newProject);
	});

	it('should update an existing project in the projectStore', () => {
		const projectId = crypto.randomUUID();
		const initialProject = {
			name: 'Initial Project',
			id: projectId,
			color: getColor(),
			created: Date.now(),
		};

		projects.create(initialProject);
		projects.update(projectId, { name: 'Updated Project' });
		expect(projectStore[0].name).toBe('Updated Project');
	});

	it('should delete a project from the projectStore', () => {
		const projectId = crypto.randomUUID();
		const initialProject = {
			name: 'Project to Delete',
			id: projectId,
			color: getColor(),
			created: Date.now(),
		};

		projects.create(initialProject);
		projects.delete(projectId);
		expect(projectStore).toHaveLength(0);
	});

	it('should list all projects in the projectStore', () => {
		const projectsToAdd = [
			{
				name: 'Project 1',
				id: crypto.randomUUID(),
				color: getColor(),
				created: Date.now(),
			},
			{
				name: 'Project 2',
				id: crypto.randomUUID(),
				color: getColor(),
				created: Date.now(),
			},
		];

		projectsToAdd.forEach((project) => projects.create(project));
		expect(projects.list()).toHaveLength(2);
		expect(projects.list()).toMatchObject(projectsToAdd);
	});
});

describe('Color Management', () => {
	it('identifies used colors correctly', () => {
		projects.create({
			name: 'Color Test',
			id: crypto.randomUUID(),
			color: 'Coral',
			created: Date.now(),
		});
		expect(getColor()).not.toBe('Peach');
	});
});
