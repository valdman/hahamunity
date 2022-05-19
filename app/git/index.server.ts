import simpleGit, { SimpleGit } from 'simple-git';

import { promisify } from 'util';

// or split out the baseDir, supported for backward compatibility
const git: SimpleGit = simpleGit('repo', { binary: 'git' });

export async function getGitLastMessage() {
	const initResult = await wrapGitFunc(git, git.init)(git) ;
	// const remote = await promisify(git.addRemote).call(git, 'origin', 'git@github.com:steveukx/git-js.git');
	const pulled = await wrapGitFunc(git, git.pull)('origin', 'master');
	console.log({pulled, initResult});
	const messages = await (await promisify(git.log).call(git, {})).all;

	console.log({messages});
	return messages;
}

function wrapGitFunc<T extends keyof SimpleGit>(git: SimpleGit, func: SimpleGit[T]) {
	return promisify(func).bind(git);
}
