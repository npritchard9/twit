import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { createSignal, Match, Setter, Switch } from "solid-js";
import { A } from "solid-start";
import { IncomingUser } from "../../../bindings/IncomingUser";
import { Person } from "../../../bindings/Person";

type UserProps = {
	setUser: Setter<Person>;
};

export default function CreateUser(props: UserProps) {
	const [name, setName] = createSignal("");
	const [bio, setBio] = createSignal("");
	const [password, setPassword] = createSignal("");
	const qc = useQueryClient();
	const user = createMutation(() => ({
		mutationFn: async () => {
			let json: IncomingUser = { name: name(), password: password(), bio: bio() };
			let res = await fetch("http://127.0.0.1:8080/create_user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
			let user: Person = await res.json();
			if (res.status === 200) {
				sessionStorage.setItem("user", JSON.stringify(user));
				props.setUser(user);
			}
			return user;
		},
		onSuccess: () => {
			setName("");
			setPassword("");
			setBio("");
			qc.invalidateQueries({ queryKey: ["users"] });
		},
	}));

	const create_user = () => {
		user.mutate();
	};
	return (
		<div class="flex flex-col items-center h-screen justify-center gap-4">
			<Switch>
				<Match when={user.isPending}>
					<div>Posting...</div>
				</Match>
				<Match when={user.isError}>
					<div>Error: {(user.error as Error).message}</div>
				</Match>
			</Switch>
			<input
				type="text"
				placeholder="Username"
				oninput={e => setName(e.currentTarget.value)}
				value={name()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-1/3"
			/>
			<input
				type="text"
				placeholder="Password"
				oninput={e => setPassword(e.currentTarget.value)}
				value={password()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-1/3"
			/>
			<input
				type="text"
				placeholder="Bio"
				oninput={e => setBio(e.currentTarget.value)}
				value={bio()}
				class="bg-gray-600 px-2 py-4 rounded-xl w-1/3"
			/>
			<button class="bg-sky-400 rounded-full p-2 w-1/6" onclick={() => create_user()}>
				Create
			</button>
			<A
				href="/login"
				class="bg-sky-400 rounded-full p-2 w-1/6 items-center justify-center flex"
			>
				Back to Login
			</A>
		</div>
	);
}
