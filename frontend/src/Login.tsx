import { Match, Setter, Switch, createSignal } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { type User } from "../../bindings/User";

type UserProps = {
	setUser: Setter<User>;
};

export default function Login(props: UserProps) {
	return (
		<div class="flex flex-col items-center justify-center gap-4 my-4">
			<a class="bg-sky-400 rounded-full p-2" href="http://localhost:8080/login">
				Log in
			</a>
		</div>
	);
}
