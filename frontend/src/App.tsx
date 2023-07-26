import { type Component } from "solid-js";
import Login from "./Login";
import { Route, Routes } from "@solidjs/router";
import Home from "./Home";
import PostAndReplies from "./PostAndReplies";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/users/:name" component={Home} />
			<Route path="/login" component={Login} />
			<Route path="/post/:id" component={PostAndReplies} />
		</Routes>
	);
};

export default App;
