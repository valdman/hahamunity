import simpleGit, { SimpleGit } from 'simple-git';

import { promisify } from 'util';
import { writeFile, readFile } from 'fs';

// or split out the baseDir, supported for backward compatibility
const git: SimpleGit = simpleGit('repo', { binary: 'git' });


async function connectToOrigin() {
	const [initResult] = await wrapGitFunc(git, git.init);
	const [remotes, errRemote] = await wrapGitFunc(git, git.remote, 'get-url', 'origin');
	if(errRemote) {
		const [remote] = await wrapGitFunc(git, git.addRemote, 'origin', 'git@github.com:valdman/haha-test.git');
		console.log('Remote created', {remote});
	}
}
export async function connectToBranch(userName: string) {
	await connectToOrigin();

	// Refresh remote master
	const [fetchResult] = await wrapGitFunc(git, git.fetch, 'origin')
	const [mRes, mErr] = await wrapGitFunc(git, git.checkout, 'master');
	const [pulled, pullError] = await wrapGitFunc(git, git.pull, 'origin', 'master');

	// Branching
	const [checkout, errCheckout] = await wrapGitFunc(git, git.checkoutLocalBranch, userName);
	if(!errCheckout) {
		console.log(`User branch checkouted: '${userName}'`);
	}
	const [pushed, pushError] = await wrapGitFunc(git, git.push, ['--set-upstream', 'origin', userName]);
}

// Po prikolu
export async function getGitLastMessage(userName: string) {
	await connectToBranch(userName);

	const messages = await (await promisify(git.log).call(git, {})).all.map(function(value) {
		// @ts-ignore
		return value.message;
	});

	console.log({messages});
	return messages;
}


// Ne rabotaet
export async function getGitBranches(userName: string) {
	await connectToBranch(userName);

	const messages = await (await promisify(git.log).call(git, {})).all.map(function(value) {
		// @ts-ignore
		return value.message;
	});

	console.log({messages});
	return messages;
}


// Works
export async function getGitFile(userName: string, fileName: string) {
	await connectToBranch(userName);
	
	const file = await promisify(readFile)(`repo/${fileName}`, 'utf-8');

	return file;
}

// mamash Works
export async function saveGitFile(userName: string, fileName: string, content: string) {
	await connectToBranch(userName);

	const [checkoutRes, checkoutErr] = await wrapGitFunc(git, git.checkout, userName);
	console.log({checkoutRes, checkoutErr});
	const [cleanRes, cleanErr] = await wrapGitFunc(git, git.clean, ['f']);

	await promisify(writeFile)(`repo/${fileName}`, content, {
		'encoding': 'utf-8',
	});
	
	const [add, addErr] = await wrapGitFunc(git, git.add, '.');
	const [commitRes, commitErr] = await wrapGitFunc(git, git.commit, `Commit from '${userName}'`);
	
	const [pushRes, pushErr] = await wrapGitFunc(git, git.push, ['--set-upstream', 'origin', userName])

	if(cleanErr || commitErr || pushErr) {
		console.error({cleanErr, commitErr, pushErr});
		return false;
	}

	console.log({commitRes, pushRes, cleanRes})

	return true;
}

function wrapGitFunc<T extends keyof SimpleGit>(git: SimpleGit, func: SimpleGit[T], ...args: ArgumentTypes<SimpleGit[T]>): [ReturnType<SimpleGit[T]>, unknown] {
	return promisify(func)
		.bind(git)
		(...args)
		.then((res: ReturnType<SimpleGit[T]>) => [res, undefined])
		.catch((err: unknown) => [undefined, err]);
}

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
