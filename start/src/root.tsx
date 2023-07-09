// @refresh reload
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/solid-query";
import { Suspense } from "solid-js";
import {
	Body,
	ErrorBoundary,
	FileRoutes,
	Head,
	Html,
	Meta,
	Routes,
	Scripts,
	Title,
} from "solid-start";
import "./root.css";
import { UserProvider } from "./state";

export default function Root() {
	const qc = new QueryClient();
	return (
		<Html lang="en">
			<Head>
				<Title>Twit</Title>
				<Meta charset="utf-8" />
				<Meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Body>
				<QueryClientProvider client={qc}>
					<UserProvider>
						<Suspense>
							<ErrorBoundary>
								<Routes>
									<FileRoutes />
								</Routes>
							</ErrorBoundary>
						</Suspense>
					</UserProvider>
				</QueryClientProvider>
				<Scripts />
			</Body>
		</Html>
	);
}
