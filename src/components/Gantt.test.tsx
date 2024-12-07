import { describe, it, expect } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { GanttHeader } from './Gantt';

describe('GanttHeader Component', () => {
	const props = {
		cols: 7,
		zoom: 50,
		gridStartDate: Date.now(),
		gridEndDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
	};

	it('renders day labels at high zoom', () => {
		render(() => <GanttHeader {...props} zoom={50} />);
		expect(screen.getAllByText(/\d+/)).toHaveLength(props.cols);
	});

	it('renders week labels at low zoom', () => {
		render(() => <GanttHeader {...props} zoom={30} />);
		expect(screen.getByText(/Viikko/)).toBeInTheDocument();
	});

	it('renders correct month labels', () => {
		render(() => <GanttHeader {...props} />);
		const months = new Set(
			Array.from({ length: props.cols }, (_, i) => {
				const date = new Date(props.gridStartDate + i * 24 * 60 * 60 * 1000);
				return date.toLocaleString('default', { month: 'long' });
			}),
		);
		months.forEach((month) => {
			const toUppercase =
				String(month).charAt(0).toUpperCase() + String(month).slice(1);
			expect(screen.getByText(toUppercase)).toBeInTheDocument();
		});
	});
});
