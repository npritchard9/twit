import { createCookieSessionStorage, redirect } from "solid-start";
import { Person } from "../../../bindings/Person";
import { CheckUser } from "../../../bindings/CheckUser";

const storage = createCookieSessionStorage({
	cookie: {
		name: "session",
		secure: process.env.NODE_ENV === "production",
		secrets: ["abc"],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
	},
});

export async function getUser(request: Request): Promise<Person | null> {
	const cookie = request.headers.get("Cookie") ?? "";
	const session = await storage.getSession(cookie);
	const name = session.get("name");
	const password = session.get("password");
	if (!name || !password) return null;
	// const user = getUserFromDB({ name: name, password: password });
	// return await user.data;
	let json: CheckUser = { name: name, password: password };
	let res = await fetch("http://127.0.0.1:8080/user_exists", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(json),
	});
	console.log("res", res);
	if (res.status === 200) {
		let usr: Person = await res.json();
		console.log("user", usr);
		return usr;
	}
	return null;
}

export async function createUserSession(name: string, password: string, redirectTo: string) {
	const session = await storage.getSession();
	session.set("name", name);
	session.set("password", password);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
}
