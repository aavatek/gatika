import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { GanttHeader } from './Gantt';

describe('GanttHeader Component', () => {
	it('renders correct month labels for the date range', async () => {
		const gridStartDate = new Date('2024-11-20').getTime();
		const gridEndDate = new Date('2024-12-01').getTime();

		render(() => (
			<GanttHeader
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
				zoom={0}
				cols={7}
			/>
		));
		await expect(screen.getByText('Marraskuu')).toBeInTheDocument();
	});

	it('renders correct day labels with zoom', async () => {
		const gridStartDate = new Date('2024-11-15').getTime();
		const gridEndDate = new Date('2024-12-01').getTime();

		render(() => (
			<GanttHeader
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
				zoom={50}
				cols={7}
			/>
		));

		expect(screen.getByText('MA')).toBeInTheDocument();
		expect(screen.getByText('TI')).toBeInTheDocument();
		expect(screen.getByText('KE')).toBeInTheDocument();
		expect(screen.getByText('TO')).toBeInTheDocument();
		expect(screen.getByText('PE')).toBeInTheDocument();
		expect(screen.getByText('LA')).toBeInTheDocument();
		expect(screen.getByText('SU')).toBeInTheDocument();
	});

	it('renders correct week labels for the date range', async () => {
		const gridStartDate = new Date('2024-11-15').getTime();
		const gridEndDate = new Date('2024-11-30').getTime();

		render(() => (
			<GanttHeader
				gridStartDate={gridStartDate}
				gridEndDate={gridEndDate}
				zoom={30}
				cols={15}
			/>
		));
		expect(screen.getByText('Viikko 47')).toBeInTheDocument();
		expect(screen.getByText('Viikko 48')).toBeInTheDocument();
	});
});
