import { Match, Setter, Switch, createSignal } from "solid-js";
import { SendButton } from "./assets/svgs";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { ReplyMessage } from "../../bindings/ReplyMessage";
import { DBMessage } from "../../bindings/DBMessage";

const [msg, setMsg] = createSignal("");

type ReplyProps = {
	user: string;
	msg: DBMessage;
	setReplying: Setter<DBMessage | null>;
};

export default function CreateReply(props: ReplyProps) {
	const qc = useQueryClient();

	const reply_msg = createMutation(
		async (parentPath: string) => {
			console.log("id: ", props.msg.id);
			console.log("path: ", parentPath);
			let json: ReplyMessage = {
				id: props.msg.id,
				usr: props.user,
				content: msg(),
				path: parentPath === null ? `${props.msg.id}` : `${parentPath}/${props.msg.id}`,
			};
			await fetch("http://127.0.0.1:8080/reply_msg", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
		},
		{
			onSuccess: () => {
				setMsg("");
				props.setReplying(null);
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		}
	);

	return (
		<div class="flex items-center justify-center h-16">
			<Switch>
				<Match when={reply_msg.isLoading}>
					<div>Posting...</div>
				</Match>
				<Match when={reply_msg.isError}>
					<div>Error: {(reply_msg.error as Error).message}</div>
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
				onclick={() => reply_msg.mutate(props.msg.path)}
			>
				<SendButton />
			</button>
		</div>
	);
}
