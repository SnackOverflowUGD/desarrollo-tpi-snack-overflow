// Extends vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// for the RTL/renderHook suites. Runs once per test file (jsdom environment).
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL's own auto-cleanup only self-registers when it finds a GLOBAL
// `afterEach` (i.e. `test.globals: true`); this project imports test globals
// explicitly instead, so without this, `render()` from an earlier test in the
// same file stays mounted and `screen.getByRole` queries bleed across tests
// (surfaced by the first component test using `render()` + `screen`, not by
// `renderHook()`-only suites, since those never query `document.body`).
afterEach(() => {
  cleanup();
});
