import { createQuery } from "@tanstack/solid-query";
import { DBMessage } from "../../bindings/DBMessage";
import { For, Match, Setter, Show, Switch, createSignal } from "solid-js";
import { Msg } from "./Messages";
import CreateReply from "./CreateReply";

export default function Replies(props: {
	user: string;
	msg: DBMessage;
	setShowReplies: Setter<boolean>;
}) {
	const [replying, setReplying] = createSignal<DBMessage>();
	async function fetchReplies() {
		let id = props.msg.path ?? props.msg.id;
		let msgs: DBMessage[] = await (await fetch(`http://127.0.0.1:8080/msg/${id}`)).json();
		return msgs;
	}

	const replies = createQuery(() => ["replies"], fetchReplies);

	return (
		<div class="flex flex-col items-center justify-center mt-2 px-4 w-full">
			<div class="flex flex-col justify-start w-full">
				<Switch>
					<Match when={replies.isLoading}>
						<div>Loading...</div>
					</Match>
					<Match when={replies.isError}>
						<div>Error: {(replies.error as Error).message}</div>
					</Match>
					<Match when={replies.isSuccess}>
						<For each={replies.data}>
							{msg => (
								<Msg
									msg={msg}
									usr={props.user}
									setReplying={setReplying}
									setShowReplies={props.setShowReplies}
								/>
							)}
						</For>
						<Show when={replying()}>
							<div class="z-10">
								<CreateReply
									user={props.user}
									msg={replying()}
									setReplying={setReplying}
								/>
							</div>
						</Show>
					</Match>
				</Switch>
			</div>
		</div>
	);
}
