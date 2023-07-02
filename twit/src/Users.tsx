import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";
import { User } from "./User";
import { Person } from "../../bindings/Person";

export default function Users() {
	async function fetchUsers() {
		let users: Person[] = await (await fetch("http://127.0.0.1:8080/users")).json();
		console.log("users", users);
		return users;
	}
	const user_query = createQuery(() => ["users"], fetchUsers);

	return (
		<div class="mt-2">
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
