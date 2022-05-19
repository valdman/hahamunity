import { Repository, Commit } from "nodegit";

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
