import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";

type User = {
	id: string;
	name: string;
	bio: string;
};

async function fetchUsers() {
	let users: User[] = await (await fetch("http://127.0.0.1:8080/users")).json();
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

const User = (props: User) => {
	return (
		<div class="flex flex-col">
			<div class="text-2xl font-bold">{props.name}</div>
			<div>{props.bio}</div>
		</div>
	);
};
