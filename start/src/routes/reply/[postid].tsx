import { Match, Switch, createSignal } from "solid-js";
import { SendButton } from "../../assets/svgs";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { type UserReply } from "../../../../bindings/UserReply";
import { useNavigate, useParams } from "solid-start";

const [msg, setMsg] = createSignal("");

function CreateReply() {
	const params = useParams<{ postid: string }>();
	const nav = useNavigate();
	const qc = useQueryClient();

	const reply_msg = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: UserReply = {
					postid: params.postid,
                    // CHANGE THIS
					user: "Noah",
					msg: msg(),
				};
				await fetch("http://127.0.0.1:8080/reply_msg", {
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
				nav("/");
			},
		};
	});

	return (
		<div class="flex items-center justify-center h-16">
			<Switch>
				<Match when={reply_msg.isPending}>
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
				onclick={() => reply_msg.mutate()}
			>
				<SendButton />
			</button>
		</div>
	);
}

export default function Reply() {
	return (
		<div class="flex items-center justify-center h-screen">
			<CreateReply />
		</div>
	);
}