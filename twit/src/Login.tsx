import { Match, Setter, Show, Switch, createSignal } from "solid-js";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Person } from "./User";

type LoginUser = {
	name: string;
	password: string;
};

type CreateUser = {
	name: string;
	password: string;
	bio: string;
};

type UserProps = {
	setUser: Setter<Person>;
};

const [showCreate, setShowCreate] = createSignal(false);
const [name, setName] = createSignal("");
const [bio, setBio] = createSignal("");
const [password, setPassword] = createSignal("");

export default function Login(props: UserProps) {
	const qc = useQueryClient();
	const user_mutation = createMutation(
		async () => {
			let json: LoginUser = { name: name(), password: password() };
			let res = await fetch("http://127.0.0.1:8080/user_exists", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
			if (res.status === 200) {
				props.setUser(await res.json());
			}
		},
		{
			onSuccess: () => {
				setName("");
				setPassword("");
				qc.invalidateQueries({ queryKey: ["users"] });
			},
		}
	);

	const login_user = () => {
		user_mutation.mutate();
	};
	return (
		<div class="flex flex-col items-center justify-center gap-4 mb-4">
			<Show when={!showCreate()} fallback={<CreateUser setUser={props.setUser} />}>
				<Switch>
					<Match when={user_mutation.isLoading}>
						<div>Posting...</div>
					</Match>
					<Match when={user_mutation.isError}>
						<div>Error: {(user_mutation.error as Error).message}</div>
					</Match>
				</Switch>
				<input
					type="text"
					placeholder="Username"
					oninput={e => setName(e.currentTarget.value)}
					value={name()}
					class="bg-gray-600 px-2 py-4 rounded-xl w-3/4"
				/>
				<input
					type="text"
					placeholder="Password"
					oninput={e => setPassword(e.currentTarget.value)}
					value={password()}
					class="bg-gray-600 px-2 py-4 rounded-xl w-3/4"
				/>
				<button class="bg-sky-400 rounded-full p-2" onclick={() => login_user()}>
					Log in
				</button>
				<button class="bg-sky-400 rounded-full p-2" onclick={() => setShowCreate(true)}>
					Create an Account
				</button>
			</Show>
		</div>
	);
}

function CreateUser(props: UserProps) {
	const qc = useQueryClient();
	const user_mutation = createMutation(
		async () => {
			let json: CreateUser = { name: name(), password: password(), bio: bio() };
			let res = await fetch("http://127.0.0.1:8080/create_user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
			if (res.status === 200) {
				props.setUser(await res.json());
			}
		},
		{
			onSuccess: () => {
				setName("");
				setPassword("");
				setBio("");
				qc.invalidateQueries({ queryKey: ["users"] });
			},
		}
	);

	const create_user = () => {
		user_mutation.mutate();
	};
	return (
		<div class="flex flex-col items-center justify-center gap-4 mb-4">
			<Switch>
				<Match when={user_mutation.isLoading}>
					<div>Posting...</div>
				</Match>
				<Match when={user_mutation.isError}>
					<div>Error: {(user_mutation.error as Error).message}</div>
				</Match>
			</Switch>
			<input
				type="text"
				placeholder="Username"
				oninput={e => setName(e.currentTarget.value)}
				value={name()}
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
			<button class="bg-sky-400 rounded-full p-2" onclick={() => create_user()}>
				Create
			</button>
			<button class="bg-sky-400 rounded-full p-2" onclick={() => setShowCreate(false)}>
				Back to Login
			</button>
		</div>
	);
}
