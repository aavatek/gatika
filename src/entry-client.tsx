// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: <false alarm>
mount(() => <StartClient />, document.getElementById("app")!);
