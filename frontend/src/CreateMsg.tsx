import { Match, Switch, createSignal } from "solid-js";
import { SendButton } from "./assets/svgs";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { UserPost } from "../../bindings/UserPost";

const [msg, setMsg] = createSignal("");

export default function CreateMsg(props: { user: string }) {
	const qc = useQueryClient();
	const msg_mutation = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: UserPost = { user: props.user, msg: msg() };
				await fetch("https://axumtwit.shuttleapp.rs/create_msg", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(json),
				});
			},
			onSuccess: () => {
				setMsg("");
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		};
	});

	const post_msg = () => {
		msg_mutation.mutate();
	};
	return (
		<div class="flex items-center justify-center h-16">
			<Switch>
				<Match when={msg_mutation.isPending}>
					<div>Posting...</div>
				</Match>
				<Match when={msg_mutation.isError}>
					<div>Error: {(msg_mutation.error as Error).message}</div>
				</Match>
			</Switch>
			<input
				type="text"
				placeholder="Send a message..."
				oninput={e => setMsg(e.currentTarget.value)}
				value={msg()}
				class="bg-black px-2 py-4 rounded-xl w-3/4 outline-none"
			/>
			<button
				class="bg-sky-400 rounded-full p-2 disabled:bg-black disabled:text-gray-600 duration-300 transition-colors"
				disabled={msg().length === 0}
				onclick={() => post_msg()}
			>
				<SendButton />
			</button>
		</div>
	);
}
