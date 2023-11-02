import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show } from "solid-js";
import { type UserAndPost } from "../../bindings/UserAndPost";
import { type LikePost } from "../../bindings/LikePost";
import { DeleteButton, HeartButton, ReplyButton } from "./assets/svgs";
import { A } from "@solidjs/router";

type View = "All" | "Me";
type MessagesProps = {
	user: string;
};
const [currMsg, setCurrMsg] = createSignal<UserAndPost | null>();

export default function Messages(props: MessagesProps) {
	const [view, setView] = createSignal<View>("All");

	async function fetchMe() {
		let msgs: UserAndPost[] = await (
			await fetch(`https://twit.shuttleapp.rs/user/${encodeURI(props.user)}`)
		).json();
		return msgs;
	}

	async function fetchMsgs() {
		let msgs: UserAndPost[] = await (await fetch("https://twit.shuttleapp.rs/msgs")).json();
		return msgs;
	}
	const msg_query = createQuery(() => {
		return { queryKey: ["msgs"], queryFn: fetchMsgs };
	});
	const me_query = createQuery(() => {
		return { queryKey: ["me"], queryFn: fetchMe };
	});

	return (
		<div class="flex flex-col items-center justify-center mt-2 px-4 w-full">
			<div class="flex justify-center gap-4 w-full items-center pb-2 border-b border-b-gray-800">
				<button
					class={`${
						view() === "Me"
							? "font-bold underline underline-offset-4 decoration-sky-400"
							: "text-gray-600"
					}`}
					onclick={() => setView("Me")}
				>
					Me
				</button>
				<button
					class={`${
						view() === "All"
							? "font-bold underline underline-offset-4 decoration-sky-400"
							: "text-gray-600"
					}`}
					onclick={() => setView("All")}
				>
					All
				</button>
			</div>
			<div class="flex flex-col justify-start w-full">
				<Show
					when={view() === "All"}
					fallback={
						<Switch>
							<Match when={me_query.isPending}>
								<div>Loading...</div>
							</Match>
							<Match when={me_query.isError}>
								<div>Error: {(me_query.error as Error).message}</div>
							</Match>
							<Match when={me_query.isSuccess}>
								<For each={me_query.data}>
									{msg => <Msg data={msg} user={props.user} />}
								</For>
							</Match>
						</Switch>
					}
				>
					<Switch>
						<Match when={msg_query.isPending}>
							<div>Loading...</div>
						</Match>
						<Match when={msg_query.isError}>
							<div>Error: {(msg_query.error as Error).message}</div>
						</Match>
						<Match when={msg_query.isSuccess}>
							<For each={msg_query.data}>
								{msg => <Msg data={msg} user={props.user} />}
							</For>
						</Match>
					</Switch>
				</Show>
			</div>
		</div>
	);
}

type MsgProps = {
	data: UserAndPost;
	user: string;
};

export const Msg = (props: MsgProps) => {
	console.log("Msg props: ", props.data.post);
	const qc = useQueryClient();
	const delete_msg = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: LikePost = {
					id: props.data.post.id,
					user: props.data.user.name,
				};
				await fetch("http://twit.shuttleapp.rs/delete_msg", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(json),
				});
			},
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		};
	});

	const like_msg = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: LikePost = { id: props.data.post.id, user: props.data.user.name };
				await fetch("http://twit.shuttleapp.rs/like_msg", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(json),
				});
			},
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		};
	});

	if (
		props.data === undefined ||
		props.data.user === undefined ||
		props.data.post === undefined
	) {
		return <div>Empty</div>;
	}
	let utc = new Date(props.data.post.ts);

	return (
		<div
			class="flex flex-col border-b border-b-gray-800 p-2"
			onclick={() => {
				setCurrMsg(props.data);
			}}
		>
			<div class="flex gap-2 items-center">
				<div class="font-bold">{props.data.user.name}</div>
				<div class="text-gray-600 text-sm">{utc.toLocaleString()}</div>
			</div>
			<div>{props.data.post.msg}</div>
			<div class="flex gap-4 items-center">
				<A href={`/post/${props.data.post.id}`} class="text-gray-600 hover:text-sky-700">
					<ReplyButton />
				</A>
				<button
					class="text-gray-600 hover:text-pink-400"
					onclick={() => {
						like_msg.mutate();
					}}
				>
					<div class="flex gap-2 items-center">
						<HeartButton />
						{props.data.post.likes.toString()}
					</div>
				</button>
				<Show when={props.data.user.name === props.user}>
					<button
						class="text-gray-600 hover:text-red-700"
						onclick={() => delete_msg.mutate()}
					>
						<DeleteButton />
					</button>
				</Show>
			</div>
		</div>
	);
};
