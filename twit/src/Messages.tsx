import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show } from "solid-js";
import { Message } from "../../bindings/Message";
import { DeleteMessage } from "../../bindings/DeleteMessage";
import { DeleteButton, HeartButton } from "./assets/svgs";

type View = "All" | "Me";

export default function Messages(props: { user: string }) {
	const [view, setView] = createSignal<View>("All");
	async function fetchMe() {
		let msgs: Message[] = await (
			await fetch(`http://127.0.0.1:8080/user/${props.user}`)
		).json();
		return msgs;
	}

	async function fetchMsgs() {
		let msgs: Message[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
		return msgs;
	}
	const msg_query = createQuery(() => ["msgs"], fetchMsgs);
	const me_query = createQuery(() => ["me"], fetchMe);

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
									{msg => <Msg msg={msg} userid={props.user} />}
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
								{msg => <Msg msg={msg} userid={props.user} />}
							</For>
						</Match>
					</Switch>
				</Show>
			</div>
		</div>
	);
}

type MsgProps = {
	msg: Message;
	userid: string;
};

const Msg = (props: MsgProps) => {
	const qc = useQueryClient();
	const delete_msg = createMutation(
		async () => {
			let json: DeleteMessage = { userid: props.msg.userid, ts: props.msg.ts };
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

	let utc = new Date(props.msg.ts);

	return (
		<div class="flex flex-col border-b border-b-gray-800 p-2">
			<div class="flex gap-2 items-center">
				<div class="font-bold">{props.msg.userid}</div>
				<div class="text-gray-600 text-sm">{utc.toLocaleString()}</div>
			</div>
			<div>{props.msg.content}</div>
			<div class="flex gap-4 items-center">
				<button class="text-gray-600 hover:text-pink-400">
					<HeartButton />
				</button>
				<Show when={props.userid === props.msg.userid}>
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
