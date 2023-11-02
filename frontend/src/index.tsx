/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import App from "./App";

const qc = new QueryClient();

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
	);
}

render(
	() => (
		<Router>
			<QueryClientProvider client={qc}>
				<App />
			</QueryClientProvider>
		</Router>
	),
	root!
);
