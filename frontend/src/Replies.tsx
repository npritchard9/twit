import { createQuery } from "@tanstack/solid-query";
import { DBPost } from "../../bindings/DBPost";
import { Accessor, For, Match, Setter, Show, Switch, createSignal } from "solid-js";
import { Msg } from "./Messages";
import CreateReply from "./CreateReply";

export default function Replies(props: {
	user: string;
	msg: Accessor<DBPost>;
	setShowReplies: Setter<boolean>;
}) {
	console.log("REPLIES CUR MSG: ", props.msg());
	const [replying, setReplying] = createSignal<DBPost>();
	async function fetchReplies() {
		let msgs: DBPost[] = await (
			await fetch(`http://127.0.0.1:8080/msg/${props.msg().id}`)
		).json();
		return msgs;
	}

	const replies = createQuery(() => {
		return {
			queryKey: ["replies"],
			queryFn: fetchReplies,
		};
	});

	return (
		<div class="flex flex-col items-center justify-center mt-2 px-4 w-full">
			<div class="flex flex-col justify-start w-full">
				<Switch>
					<Match when={replies.isPending}>
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
									user={props.user}
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
