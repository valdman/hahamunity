import simpleGit, { SimpleGit } from 'simple-git';

import { promisify } from 'util';

// or split out the baseDir, supported for backward compatibility
const git: SimpleGit = simpleGit('repo', { binary: 'git' });

export async function getGitLastMessage() {
	const initResult = await promisify(git.init).call(git) ;
	// const remote = await promisify(git.addRemote).call(git, 'origin', 'git@github.com:steveukx/git-js.git');
	const pulled = await promisify(git.pull).call(git, 'origin', 'master');
	console.log({pulled, initResult});
	const messages = await (await promisify(git.log).call(git, {})).all;

	console.log({messages});
	return messages;
}
