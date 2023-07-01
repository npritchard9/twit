import { createQuery } from "@tanstack/solid-query";
import { Switch, Match, For } from "solid-js";
import { Message } from "../../bindings/Message";

async function fetchMsgs() {
	let msgs: Message[] = await (await fetch("http://127.0.0.1:8080/msgs")).json();
	return msgs;
}

export default function Messages() {
	const msg_query = createQuery(() => ["msgs"], fetchMsgs);

	return (
		<div class="mt-2 px-4 w-full">
			<div class="flex justify-start gap-4 w-1/2 items-center">
				<button class="bg-sky-300/50 rounded-xl py-2 px-4">Me</button>
				<button class="bg-sky-300/50 rounded-xl py-2 px-4">All</button>
			</div>
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
		</div>
	);
}

const Msg = (props: Message) => {
	let utc = new Date(props.ts);
	// let offset = utc.getTimezoneOffset() * 60 * 1000;
	// let loc = utc.getTime() + offset;
	// console.log("loc", loc);
	// console.log("diff", utc.getTime() - loc);
	// let time_diff = Date.now() - loc;
	// console.log("diff", time_diff);
	// let secs = parseInt((time_diff / 60).toFixed(0));
	// let time = secs + "s ago";
	// if (secs >= 60) {
	// 	let mins = parseInt((secs / 60).toFixed(0));
	// 	time = mins + "m ago";
	// 	if (mins >= 60) {
	// 		let hours = parseInt((mins / 60).toFixed(0));
	// 		time = hours + "h ago";
	// 		if (hours >= 24) {
	// 			let days = parseInt((hours / 24).toFixed(0));
	// 			time = days + "d ago";
	// 		}
	// 	}
	// }

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
