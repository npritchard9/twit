import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";
import { Person } from "../../bindings/Person";

export default function Users() {
	async function fetchUsers() {
		let users: Person[] = await (await fetch("http://127.0.0.1:8080/users")).json();
		return users;
	}
	const user_query = createQuery(() => ["users"], fetchUsers);

	return (
		<div class="bg-gray-700 rounded-xl m-2">
			<div class="text-2xl font-bold p-2">Who to follow</div>
			<Switch>
				<Match when={user_query.isLoading}>
					<div>Loading...</div>
				</Match>
				<Match when={user_query.isError}>
					<div>Error: {(user_query.error as Error).message}</div>
				</Match>
				<Match when={user_query.isSuccess}>
					<For each={user_query.data}>{user => <Profile {...user} />}</For>
				</Match>
			</Switch>
		</div>
	);
}

const Profile = (props: Person) => {
	return (
		<div class="flex flex-col p-2 hover:bg-gray-600 last:rounded-b-xl">
			<div class="font-bold">{props.name}</div>
			<div>{props.bio}</div>
		</div>
	);
};