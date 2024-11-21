import { setTaskStore, taskStore, type Task } from '@features/Task';
import { batch } from 'solid-js';
import { unwrap } from 'solid-js/store';

const undoStack: Task[][] = [];
const redoStack: Task[][] = [];
const MAX_HISTORY = 4;

export const handleHistory = (state: Task[]) => {
	const copy = structuredClone(unwrap(state));
	if (
		undoStack.length > 0 &&
		JSON.stringify(copy) === JSON.stringify(undoStack[undoStack.length - 1])
	) {
		return;
	}

	if (undoStack.length > MAX_HISTORY) {
		undoStack.shift();
	}

	undoStack.push(copy);
};

export const undo = () => {
	if (undoStack.length === 0) return;
	const latestState = undoStack.pop();

	if (latestState) {
		batch(() => {
			redoStack.push(structuredClone(unwrap(taskStore)));
			setTaskStore(latestState);
		});
	}
};

export const redo = () => {
	if (redoStack.length === 0) return;
	const latestState = redoStack.pop();

	if (latestState) {
		batch(() => {
			undoStack.push(structuredClone(unwrap(taskStore)));
			setTaskStore(latestState);
		});
	}
};
