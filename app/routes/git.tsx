import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getGitLastMessage } from "~/git";

export async function loader() {
	const message = await getGitLastMessage();
	return json({message});
}

export default function Git() {
	const {message} = useLoaderData();
	console.log({message})
	return <>{message}</>;
}
