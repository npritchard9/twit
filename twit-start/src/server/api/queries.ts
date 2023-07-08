import { query$ } from "@prpc/solid";
import { z } from "zod";
import { CheckUser } from "../../../../bindings/CheckUser";

export const getUserFromDB = query$({
	queryFn: async ({ payload }) => {
		let json: CheckUser = { name: payload.name, password: payload.password };
		let res = await fetch("http://127.0.0.1:8080/user_exists", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(json),
		});
		if (res.status === 200) {
			let usr = await res.json();
			return usr;
		}
		return null;
	},
	key: "user",
	schema: z.object({ name: z.string(), password: z.string() }),
});
