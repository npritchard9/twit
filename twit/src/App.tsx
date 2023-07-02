import { Show, type Component, createSignal } from "solid-js";
import Messages from "./Messages";
import Users from "./Users";
import CreateMsg from "./CreateMsg";
import { User } from "./User";
import Login from "./Login";
import { Person } from "../../bindings/Person";

const [user, setUser] = createSignal<Person>(JSON.parse(sessionStorage.getItem("user")) ?? null);

const App: Component = () => {
	return (
		<div class="flex m-4 h-screen">
			<div class="grid grid-cols-3 w-full h-full items-center justify-items-center">
				<div class="flex flex-col justify-start col-span-1 h-full w-full border-r border-r-gray-600">
					<Show
						when={user()}
						fallback={
							<div class="border-b border-b-gray-600 w-full">
								<Login setUser={setUser} />
							</div>
						}
					>
						<div class="border-b border-b-gray-600 w-full">
							<User {...user()} />
						</div>
					</Show>
					<Users />
				</div>
				<div class="flex flex-col items-center justify-start col-span-2 h-full w-full">
					<div class="border-b border-b-gray-600 w-full">
						<CreateMsg userid={user().name} />
					</div>
					<Messages user={user().name} />
				</div>
			</div>
		</div>
	);
};

export default App;
