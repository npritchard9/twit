import { type Component } from "solid-js";
import Messages from "./Messages";
import Users from "./Users";
import CreateMsg from "./CreateMsg";

const App: Component = () => {
	return (
		<div class="flex m-4 h-screen">
			<div class="grid grid-cols-3 w-full h-full items-center justify-items-center">
				<div class="flex justify-start col-span-1 h-full w-full border-r border-r-gray-600">
					<Users />
				</div>
				<div class="flex flex-col items-center justify-start col-span-2 h-full w-full">
					<div class="border-b border-b-gray-600 w-full">
						<CreateMsg />
					</div>
					<Messages />
				</div>
			</div>
		</div>
	);
};

export default App;
