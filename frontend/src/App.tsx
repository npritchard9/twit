import { type Component } from "solid-js";
import Login from "./Login";
import { Route, Routes } from "@solidjs/router";
import Home from "./Home";

const App: Component = () => {
	return (
		<Routes>
			<Route path="/users/:name" component={Home} />
			<Route path="/login" component={Login} />
		</Routes>
	);
};

export default App;
