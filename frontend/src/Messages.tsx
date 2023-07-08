import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show, Setter, createEffect } from "solid-js";
import { DBPost } from "../../bindings/DBPost";
import { LikePost } from "../../bindings/LikePost";
import { DeleteButton, HeartButton, ReplyButton } from "./assets/svgs";
import CreateReply from "./CreateReply";
import Replies from "./Replies";

type View = "All" | "Me";
const [currMsg, setCurrMsg] = createSignal<DBPost | null>();

export default function Messages(props: { user: string }) {
	const [view, setView] = createSignal<View>("All");
	const [replying, setReplying] = createSignal<DBPost | null>();
	const [showReplies, setShowReplies] = createSignal(false);

	createEffect(() => {
		console.log("curr msg: ", currMsg());
	});

	async function fetchMe() {
		let msgs: DBPost[] = await (await fetch(`http://127.0.0.1:8080/user/${props.user}`)).json();
		return msgs;
	}

	async function fetchMsgs() {
		let msgs: DBPost[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
		return msgs;
	}
	const msg_query = createQuery(() => ["msgs"], fetchMsgs);
	const me_query = createQuery(() => ["me"], fetchMe);

	return (
		<div
			class={`flex flex-col items-center justify-center mt-2 px-4 w-full ${
				replying ?? "bg-gray-500"
			}`}
		>
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
									{msg => (
										<Msg
											msg={msg}
											user={props.user}
											setReplying={setReplying}
											setShowReplies={setShowReplies}
										/>
									)}
								</For>
								<Switch>
									<Match when={replying()}>
										<div class="z-10">
											<CreateReply
												user={props.user}
												msg={replying()}
												setReplying={setReplying}
											/>
										</div>
									</Match>
									<Match when={showReplies()}>
										<div>
											<Replies
												user={props.user}
												msg={currMsg()}
												setShowReplies={setShowReplies}
											/>
										</div>
									</Match>
								</Switch>
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
								{msg => (
									<Msg
										msg={msg}
										user={props.user}
										setReplying={setReplying}
										setShowReplies={setShowReplies}
									/>
								)}
							</For>
							<Switch>
								<Match when={replying()}>
									<div class="z-10">
										<CreateReply
											user={props.user}
											msg={replying()}
											setReplying={setReplying}
										/>
									</div>
								</Match>
								<Match when={showReplies()}>
									<div>
										<Replies
											user={props.user}
											msg={currMsg()}
											setShowReplies={setShowReplies}
										/>
									</div>
								</Match>
							</Switch>
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
	setReplying: Setter<DBPost | null>;
	setShowReplies: Setter<boolean>;
};

export const Msg = (props: MsgProps) => {
	// const [like, setLike] = createSignal(false);
	const qc = useQueryClient();
	const delete_msg = createMutation(
		async () => {
			let json: LikePost = { id: props.msg.id, user: props.user };
			await fetch("http://127.0.0.1:8080/delete_msg", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
		},
		{
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		}
	);

	const like_msg = createMutation(
		async () => {
			let json: LikePost = { id: props.msg.id, user: props.user };
			console.log(json);
			await fetch("http://127.0.0.1:8080/like_msg", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(json),
			});
		},
		{
			onSuccess: () => {
				qc.invalidateQueries({ queryKey: ["msgs"] });
				qc.invalidateQueries({ queryKey: ["me"] });
			},
		}
	);

	let utc = new Date(props.msg.ts);

	return (
		<div
			class="flex flex-col border-b border-b-gray-800 p-2"
			onclick={() => {
				props.setShowReplies(true);
				setCurrMsg(props.msg);
			}}
		>
			<div class="flex gap-2 items-center">
				{/*<div class="font-bold">{props.msg}</div>*/}
				<div class="text-gray-600 text-sm">{utc.toLocaleString()}</div>
			</div>
			<div>{props.msg.msg}</div>
			<div class="flex gap-4 items-center">
				<button
					class="text-gray-600 hover:text-sky-700"
					onclick={() => {
						props.setReplying(props.msg);
					}}
				>
					<ReplyButton />
				</button>
				<button
					class="text-gray-600 hover:text-pink-400"
					onclick={() => {
						// setLike(p => !p);
						like_msg.mutate();
					}}
				>
					<div class="flex gap-2 items-center">
						<HeartButton />
						{props.msg.likes.toString()}
					</div>
				</button>
				{/*<Show when={props.usr === props.msg.usr}>
					<button
						class="text-gray-600 hover:text-red-700"
						onclick={() => delete_msg.mutate()}
					>
						<DeleteButton />
					</button>
				</Show>*/}
			</div>
		</div>
	);
};
