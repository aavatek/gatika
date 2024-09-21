// @refresh reload
import { StartClient, mount } from '@solidjs/start/client';

// biome-ignore lint/style/noNonNullAssertion: <false alarm>
mount(() => <StartClient />, document.getElementById('app')!);
