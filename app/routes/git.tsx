import Git, { Commit, Repository } from "nodegit";
import { convertCompilerOptionsFromJson } from "typescript";

function getMostRecentCommit(repository: Repository) {
	return repository.getBranchCommit("master");
}

function getCommitMessage(commit: Commit) {
	return commit.message();
}

export async function getGitConnection() {
	const repo = await Git.Repository.open("nodegit");
	const lastCommit = await getMostRecentCommit(repo);
	const lastMessage = getCommitMessage(lastCommit);
	console.log({lastMessage});
	return repo;
}
