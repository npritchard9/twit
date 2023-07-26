import { UserInfo } from "./User";
import Users from "./Users";
import CreateMsg from "./CreateMsg";
import Messages from "./Messages";
import { useParams } from "@solidjs/router";
import { onMount } from "solid-js";

export default function Home() {
	const params = useParams<{ name: string }>();
	const name = decodeURI(params.name);
	console.log(name);
	onMount(() => {
		sessionStorage.setItem("user", name);
	});
	return (
		<div class="flex h-screen">
			<div class="grid grid-cols-4 w-full h-full items-center justify-items-center">
				<div class="flex flex-col justify-start col-span-1 h-full w-full border-r border-r-gray-600">
					<div class="border-b border-b-gray-600 w-full">
						<UserInfo name={name} />
					</div>
					<Users />
				</div>
				<div class="flex flex-col items-center justify-start col-span-3 h-full w-full">
					<div class="border-b border-b-gray-600 w-full">
						<CreateMsg user={name} />
					</div>
					<Messages user={name} />
				</div>
			</div>
		</div>
	);
}
