import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show } from "solid-js";
import { type DBPost } from "../../../bindings/DBPost";
import { type UserAndPost } from "../../../bindings/UserAndPost";
import { type LikePost } from "../../../bindings/LikePost";
import { DeleteButton, HeartButton, ReplyButton } from "../assets/svgs";
import { A } from "solid-start";

type View = "All" | "Me";

const [_currMsg, setCurrMsg] = createSignal<DBPost | null>();
export default function Messages() {
	const [view, setView] = createSignal<View>("All");

	async function fetchMe() {
		let msgs: UserAndPost[] = await (
            // CHANGE THIS
			await fetch(`http://127.0.0.1:8080/user/${"Noah"}`)
		).json();
		return msgs;
	}

	async function fetchMsgs() {
		let msgs: UserAndPost[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
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
							<Match when={me_query.isLoading}>
								<div>Loading...</div>
							</Match>
							<Match when={me_query.isError}>
								<div>Error: {(me_query.error as Error).message}</div>
							</Match>
							<Match when={me_query.isSuccess}>
								<For each={me_query.data}>
									{msg => <Msg msg={msg.post} user={msg.user.name} />}
								</For>
							</Match>
						</Switch>
					}
				>
					<Switch>
						<Match when={msg_query.isLoading}>
							<div>Loading...</div>
						</Match>
						<Match when={msg_query.isError}>
							<div>Error: {(msg_query.error as Error).message}</div>
						</Match>
						<Match when={msg_query.isSuccess}>
							<For each={msg_query.data}>
								{msg => <Msg msg={msg.post} user={msg.user.name} />}
							</For>
						</Match>
					</Switch>
				</Show>
			</div>
		</div>
	);
}

type MsgProps = {
	msg: DBPost;
	user: string;
};

export const Msg = (props: MsgProps) => {
	const qc = useQueryClient();
	const delete_msg = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: LikePost = { id: props.msg.id, user: props.user };
				await fetch("http://127.0.0.1:8080/delete_msg", {
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
                // CHANGE THIS
				let json: LikePost = { id: props.msg.id, user: "Noah" };
				console.log(json);
				await fetch("http://127.0.0.1:8080/like_msg", {
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

	// async function fetchUserLikesMsg() {
	// 	let likes: boolean = await (
	// 		await fetch(`http://127.0.0.1:8080/${user()!.name}/likes/${props.msg.id.split(":")[1]}`)
	// 	).json();
	// 	console.log(`${user()!.name} likes ${props.msg.id}? ${likes}`);
	// 	return likes;
	// }
	// const likes_query = createQuery(() => {
	// 	return { queryKey: ["likes_msg"], queryFn: fetchUserLikesMsg };
	// });

	let utc = new Date(props.msg.ts);

	return (
		<div
			class="flex flex-col border-b border-b-gray-800 p-2"
			onclick={() => {
				setCurrMsg(props.msg);
			}}
		>
			<div class="flex gap-2 items-center">
				<div class="font-bold">{props.user}</div>
				<div class="text-gray-600 text-sm">{utc.toLocaleString()}</div>
			</div>
			<div>{props.msg.msg}</div>
			<div class="flex gap-4 items-center">
				<A class="text-gray-600 hover:text-sky-700" href={`/reply/${props.msg.id}`}>
					<ReplyButton />
				</A>
				<button
					class="text-gray-600 hover:text-pink-400"
					onclick={() => {
						like_msg.mutate();
					}}
				>
					<div
						// class={`flex gap-2 items-center ${
						// 	likes_query.data === true && "text-pink-400"
						// }`}
						class="flex gap-2 items-center"
					>
						<HeartButton />
						{props.msg.likes}
					</div>
				</button>
				<Show when={props.user === props.user}>
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
