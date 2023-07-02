import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For, createSignal, Show } from "solid-js";
import { Message } from "../../bindings/Message";

type View = "All" | "Me";

export default function Messages(props: { user: string }) {
	const [view, setView] = createSignal<View>("All");
	async function fetchMe() {
		let msgs: Message[] = await (await fetch(`http://127.0.0.1:8080/user/${props.user}`)).json();
		return msgs;
	}

	async function fetchMsgs() {
		let msgs: Message[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
		return msgs;
	}
	const msg_query = createQuery(() => ["msgs"], fetchMsgs);
	const me_query = createQuery(() => ["me"], fetchMe);

	return (
		<div class="mt-2 px-4 w-full">
			<div class="flex justify-start gap-4 w-1/2 items-center">
				<button
					class={`bg-sky-300/50 rounded-xl py-2 px-4 ${
						view() === "Me" && "bg-sky-400 text-black"
					}`}
					onclick={() => setView("Me")}
				>
					Me
				</button>
				<button
					class={`bg-sky-300/50 rounded-xl py-2 px-4 ${
						view() === "All" && "bg-sky-400 text-black"
					}`}
					onclick={() => setView("All")}
				>
					All
				</button>
			</div>
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
							<For each={me_query.data}>{msg => <Msg {...msg} />}</For>
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
						<For each={msg_query.data}>{msg => <Msg {...msg} />}</For>
					</Match>
				</Switch>
			</Show>
		</div>
	);
}

const Msg = (props: Message) => {
	let utc = new Date(props.ts);

	return (
		<div class="flex flex-col">
			<div class="flex gap-2 items-center">
				<div>{props.userid}</div>
				<div class="text-gray-600 text-sm">{utc.toLocaleString()}</div>
			</div>
			<div>{props.content}</div>
		</div>
	);
};
