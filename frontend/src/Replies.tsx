import { createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Msg } from "./Messages";
import CreateReply from "./CreateReply";
import { UserAndPost } from "../../bindings/UserAndPost";

type RepliesProps = {
	user: string;
	data: UserAndPost;
	id: string;
};

export default function Replies(props: RepliesProps) {
	console.log("Replies props: ", props.data);
	const [replying, setReplying] = createSignal<UserAndPost>();
	async function fetchReplies() {
		let replies: UserAndPost[] = await (
			await fetch(`http://twit.shuttleapp.rs/msg/${props.id}/replies`)
		).json();
		console.log("REPLIES: ", replies);
		return replies;
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
						<div class="p-2 border-b border-b-gray-600">
							<Msg data={props.data} user={props.user} />
						</div>
						<For each={replies.data}>{msg => <Msg data={msg} user={props.user} />}</For>
						<Show when={replying()}>
							<div class="z-10">
								<CreateReply user={props.user} msg={replying()} />
							</div>
						</Show>
					</Match>
				</Switch>
			</div>
		</div>
	);
}
