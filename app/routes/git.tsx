import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getGitFile, getGitLastMessage } from "~/git/index.server";

export async function loader() {
	const message = await getGitLastMessage('boris');
	const file = await getGitFile('boris', '.gitignore');
	return json({message, file});
}

export default function Git() {
	const {message, file} = useLoaderData();
	console.log({message, file})
	return <>{message}</>;
}
