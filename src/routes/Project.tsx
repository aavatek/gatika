import { useNavigate } from '@solidjs/router';
import { Button } from '../components/form/Button';

export const ProjectListView = () => {
	return (
		<main>
			<h1>Projektit</h1>
		</main>
	);
};

export const ProjectView = () => {
	return (
		<main>
			<h1>Projekti: ...</h1>
		</main>
	);
};

export const ProjectEditView = () => {
	return (
		<main>
			<h1>Projekti: ...</h1>
		</main>
	);
};

const NotFoundView = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate(-1);

	return (
		<main>
			<h1>Tehtävää ei löytynyt</h1>
			<Button label="Takaisin" onclick={handleBack} />
		</main>
	);
};
