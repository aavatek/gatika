import { cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";

// automatically cleanup after each test
afterEach(() => {
	cleanup();
});
