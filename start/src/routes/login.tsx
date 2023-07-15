import { A } from "solid-start";

export default function Login() {
	return (
		<div class="flex flex-col items-center justify-center h-screen gap-4">
			<A
				href="http://localhost:8080/login"
				class="flex items-center justify-center bg-sky-400 rounded-full p-2 w-1/6"
			>
				Login
			</A>
		</div>
	);
}
