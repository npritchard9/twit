import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";

export type Message = {
	userid: string;
	content: string;
	id: string;
};

async function fetchMsgs() {
	let msgs: Message[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
	return msgs;
}

export default function Messages() {
	const msg_query = createQuery(() => ["msgs"], fetchMsgs);

	return (
		<div class="mt-2">
			<Switch>
				<Match when={msg_query.isLoading}>
					<div>Loading...</div>
				</Match>
				<Match when={msg_query.isError}>
					<div>Error: {(msg_query.error as Error).message}</div>
				</Match>
				<Match when={msg_query.isSuccess}>
					<For each={msg_query.data}>{msg => <div>{msg.content}</div>}</For>
				</Match>
			</Switch>
		</div>
	);
}
