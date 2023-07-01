import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";
import { User, type Person } from "./User";

async function fetchUsers() {
	let users: Person[] = await (await fetch("http://127.0.0.1:8080/users")).json();
	return users;
}

export default function Users() {
	const user_query = createQuery(() => ["users"], fetchUsers);

	return (
		<div>
			<Switch>
				<Match when={user_query.isLoading}>
					<div>Loading...</div>
				</Match>
				<Match when={user_query.isError}>
					<div>Error: {(user_query.error as Error).message}</div>
				</Match>
				<Match when={user_query.isSuccess}>
					<For each={user_query.data}>{user => <User {...user} />}</For>
				</Match>
			</Switch>
		</div>
	);
}
