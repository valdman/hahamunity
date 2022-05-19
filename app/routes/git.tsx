import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Commit, Repository } from "nodegit";
import { convertCompilerOptionsFromJson } from "typescript";

function getMostRecentCommit(repository: Repository) {
	return repository.getBranchCommit("master");
}

function getCommitMessage(commit: Commit) {
	return commit.message();
}

export async function getGitLastMessage() {
	const repo = await Repository.open("git@github.com:valdman/hahamunity.git");
	const lastCommit = await getMostRecentCommit(repo);
	const lastMessage = getCommitMessage(lastCommit);
	console.log({lastMessage});
	return lastMessage;
}

export async function loader() {
	const message = await getGitLastMessage();
	return json({message});
}

export default function Git() {
	const {message} = useLoaderData();
	console.log({message})
	return <>{message}</>;
}
