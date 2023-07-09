import { Match, Switch, createSignal } from "solid-js";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { A } from "solid-start";
import { LoginUser } from "../../../bindings/LoginUser";

export default function Login() {
	const [name, setName] = createSignal("");
	const [password, setPassword] = createSignal("");
	const qc = useQueryClient();
	const user_exists = createMutation(() => ({
		mutationFn: async () => {
			let json: LoginUser = { name: name(), password: password() };
			let res = await fetch("http://127.0.0.1:8080/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
			if (res.status === 200) {
				let user = await res.json();
				return user;
			}
		},
		onSuccess: () => {
			setName("");
			setPassword("");
			qc.invalidateQueries({ queryKey: ["users"] });
		},
	}));

	const login_user = () => {
		user_exists.mutate();
	};

	return (
		<div class="flex flex-col items-center justify-center h-screen gap-4">
			<Switch>
				<Match when={user_exists.isPending}>
					<div>Posting...</div>
				</Match>
				<Match when={user_exists.isError}>
					<div>Error: {(user_exists.error as Error).message}</div>
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
			<button class="bg-sky-400 rounded-full p-2 w-1/6" onclick={() => login_user()}>
				Log in
			</button>
			<A
				href="/create"
				class="bg-sky-400 rounded-full p-2 w-1/6 flex items-center justify-center"
			>
				Create an Account
			</A>
		</div>
	);
}
