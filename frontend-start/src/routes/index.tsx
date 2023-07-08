import { createSignal, Show, type VoidComponent } from "solid-js";
import { createRouteData, RouteDataArgs, useRouteData } from "solid-start";
import { createServerData$, redirect } from "solid-start/server";
import { getUser } from "~/lib/session";

export function routeData() {
	return createServerData$(async (_, { request }) => {
		let user = await getUser(request);
		return user;
	});
}

const Home: VoidComponent = () => {
	let user = useRouteData<typeof routeData>();
	console.log("user in index", user());
	if (!user) throw redirect("/login");
	return <div>hello</div>;
};

export default Home;
