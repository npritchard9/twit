import { useUserContext } from "~/state";
import Login from "./Login";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show, Setter } from "solid-js";
import { type DBPost } from "../../../bindings/DBPost";
import { type UserAndPost } from "../../../bindings/UserAndPost";
import { type LikePost } from "../../../bindings/LikePost";
import { SendButton, DeleteButton, HeartButton, ReplyButton } from "../assets/svgs";
import { UserPost } from "../../../bindings/UserPost";
import { User } from "../../../bindings/User";
import { A } from "solid-start";
// import CreateReply from "./CreateReply";
// import Replies from "./Replies";

export default function Home() {
	const { user } = useUserContext()!;
	console.log("user from main: ", user());
	return (
		<div>
			<Show
				when={user()}
				fallback={
					<div>
						<Login />
					</div>
				}
			>
				<div class="grid grid-cols-4">
					<div class="col-span-1">
						<UserInfo />
					</div>
					<div class="col-span-3">
						<CreateMsg />
					</div>
				</div>
				<div class="flex">
					<div class="w-1/6">
						<Users />
					</div>
					<div class="w-5/6">
						<Messages />
					</div>
				</div>
			</Show>
		</div>
	);
}

type View = "All" | "Me";

const [currMsg, setCurrMsg] = createSignal<DBPost | null>();
function Messages() {
	const { user } = useUserContext()!;
	const [view, setView] = createSignal<View>("All");

	async function fetchMe() {
		let msgs: UserAndPost[] = await (
			await fetch(`http://127.0.0.1:8080/user/${user()!.name}`)
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
								{/*<Switch>
									<Match when={replying()}>
										<div class="z-10">
											<CreateReply
												user={user()}
												msg={replying()}
											/>
										</div>
									</Match>
									<Match when={showReplies()}>
										<div>
											<Replies
												user={props.user}
												msg={currMsg}
											/>
										</div>
									</Match>
								</Switch>*/}
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
							{/*<Switch>
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
											msg={currMsg}
											setShowReplies={setShowReplies}
										/>
									</div>
								</Match>
							</Switch>*/}
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
	const { user } = useUserContext()!;
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
				let json: LikePost = { id: props.msg.id, user: user()!.name };
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

function UserInfo() {
	const { user } = useUserContext()!;
	return (
		<div class="m-2 flex flex-col">
			<div class="text-3xl font-bold">{user()!.name}</div>
			<div>{user()!.bio}</div>
		</div>
	);
}

function CreateMsg() {
	const [msg, setMsg] = createSignal("");
	const { user } = useUserContext()!;
	const qc = useQueryClient();
	const msg_mutation = createMutation(() => {
		return {
			mutationFn: async () => {
				let json: UserPost = { user: user()!.name, msg: msg(), likes: 0 };
				await fetch("http://127.0.0.1:8080/create_msg", {
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

function Users() {
	async function fetchUsers() {
		let users: User[] = await (await fetch("http://127.0.0.1:8080/users")).json();
		return users;
	}
	const user_query = createQuery(() => {
		return {
			queryKey: ["users"],
			queryFn: fetchUsers,
		};
	});

	return (
		<div class="bg-gray-700 rounded-xl m-2">
			<div class="text-2xl font-bold p-2">Who to follow</div>
			<Switch>
				<Match when={user_query.isLoading}>
					<div>Loading...</div>
				</Match>
				<Match when={user_query.isError}>
					<div>Error: {(user_query.error as Error).message}</div>
				</Match>
				<Match when={user_query.isSuccess}>
					<For each={user_query.data}>{user => <Profile {...user} />}</For>
				</Match>
			</Switch>
		</div>
	);
}

const Profile = (props: User) => {
	return (
		<div class="flex flex-col p-2 hover:bg-gray-600 last:rounded-b-xl">
			<div class="font-bold">{props.name}</div>
			<div>{props.bio}</div>
		</div>
	);
};
