import { Accessor, Context, createContext, createSignal, Setter, useContext } from "solid-js";
import { User } from "../../bindings/User";

type UC = {
	user: Accessor<User | undefined>;
	setUser: Setter<User>;
};

const UserContext: Context<UC | undefined> = createContext();

export function UserProvider(props: any) {
	const [user, setUser] = createSignal<User>();

	return <UserContext.Provider value={{ user, setUser }}>{props.children}</UserContext.Provider>;
}

export function useUserContext() {
	return useContext(UserContext);
}
