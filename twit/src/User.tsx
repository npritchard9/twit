import { Match, Switch, createSignal } from "solid-js";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Person } from "../../bindings/Person";

const [username, setUsername] = createSignal("");
const [password, setPassword] = createSignal("");
const [bio, setBio] = createSignal("");

export function User(props: Person) {
	return (
		<div class="flex flex-col mb-4">
			<div class="text-2xl font-bold">{props.name}</div>
			<div>{props.bio}</div>
		</div>
	);
}

export function EditUser(props: Person) {
	const qc = useQueryClient();
	const user_mutation = createMutation(
		async () => {
			let json: Person = {
				name: username(),
				password: password(),
				bio: bio(),
			};
			await fetch("http://127.0.0.1:8080/edit_user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
		},
		{
			onSuccess: () => {
				setUsername("");
				setPassword("");
				setBio("");
				qc.invalidateQueries({ queryKey: ["users"] });
			},
		}
	);

	const edit_user = () => {
		user_mutation.mutate();
	};
	return (
		<div class="flex flex-col items-center justify-center gap-4 mb-4">
			<Switch>
				<Match when={user_mutation.isLoading}>
					<div>Editing...</div>
				</Match>
				<Match when={user_mutation.isError}>
					<div>Error: {(user_mutation.error as Error).message}</div>
				</Match>
			</Switch>
			<input
				type="text"
				placeholder="Username"
				oninput={e => setUsername(e.currentTarget.value)}
				value={username()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-3/4"
			/>
			<input
				type="text"
				placeholder="Password"
				oninput={e => setPassword(e.currentTarget.value)}
				value={password()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-3/4"
			/>
			<input
				type="text"
				placeholder="Bio"
				oninput={e => setBio(e.currentTarget.value)}
				value={bio()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-3/4"
			/>
			<button class="bg-sky-400 rounded-full p-2" onclick={() => edit_user()}>
				Create
			</button>
		</div>
	);
}
