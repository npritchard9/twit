import { UserInfo } from "./User";
import Users from "./Users";
import { useParams } from "@solidjs/router";
import { Match, Switch, createSignal } from "solid-js";
import Replies from "./Replies";
import CreateReply from "./CreateReply";
import { createQuery } from "@tanstack/solid-query";
import { UserAndPost } from "../../bindings/UserAndPost";

export default function PostAndReplies() {
	const [name, _] = createSignal<string | null>(sessionStorage.getItem("user"));
	const params = useParams<{ id: string }>();
	const id = params.id;
	async function fetchPost() {
		let msg: UserAndPost = await (await fetch(`http://twit.shuttleapp.rs/msg/${id}`)).json();
		console.log("Post should be: ", msg);
		return msg;
	}

	const post = createQuery(() => {
		return {
			queryKey: ["post"],
			queryFn: fetchPost,
			enabled: id !== undefined,
		};
	});
	return (
		<Switch>
			<Match when={post.isPending}>
				<div>Loading...</div>
			</Match>
			<Match when={post.isError}>
				<div>{(post.error as Error).message}</div>
			</Match>
			<Match when={post.isSuccess}>
				<div class="grid grid-cols-4 w-full h-full items-center justify-items-center">
					<div class="flex flex-col justify-start col-span-1 h-full w-full border-r border-r-gray-600">
						<div class="border-b border-b-gray-600 w-full">
							<UserInfo name={name()} />
						</div>
						<Users />
					</div>
					<div class="flex flex-col items-center justify-start col-span-3 h-full w-full">
						<div class="border-b border-b-gray-600 w-full">
							<CreateReply user={name()} msg={post.data} />
						</div>
						<Replies user={name()} data={post.data} id={id} />
					</div>
				</div>
			</Match>
		</Switch>
	);
}
