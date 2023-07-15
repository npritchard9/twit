import Messages from "../components/Messages";
import Users from "../components/Users";
import UserInfo from "../components/UserInfo";

export default function Home() {
	return (
		<div class="w-screen h-screen">
			<div class="grid grid-cols-4 border-b border-b-gray-600">
				<div class="col-span-1">
					<UserInfo />
				</div>
			</div>
			<div class="flex">
				<div class="w-1/6 border-r border-r-gray-600">
					<Users />
				</div>
				<div class="w-5/6">
					<Messages />
				</div>
			</div>
		</div>
	);
}
