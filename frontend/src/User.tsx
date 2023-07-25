import { type User } from "../../bindings/User";

export function UserInfo(props: User) {
	return <div class="text-2xl font-bold ml-4 h-16 flex items-center">{props.name}</div>;
}
