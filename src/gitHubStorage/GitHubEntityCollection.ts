/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { execSync } from 'node:child_process';
import { Octokit } from 'octokit';

import type { Entity } from '../Entity';
import type { MilestoneState } from '../MilestoneState';

/**
 * Minimal milestone shape returned by GitHub API.
 */
export interface GitHubMilestone {
	[key: string]: unknown;
	description: null | string;
	due_on: null | string;
	number: number;
	state: MilestoneState;
	title: string;
}

/**
 * Configuration for connecting to a GitHub repository.
 */
export interface GitHubMilestoneOptions {
	owner?: string;
	repo?: string;
	token?: string;
}

/**
 * Base class for GitHub-backed entity collections (issues, labels, milestones).
 */
export default abstract class GitHubEntityCollection<T extends Entity = Entity> {
	readonly octokit: Octokit;
	readonly owner: string;
	readonly repo: string;

	// eslint-disable-next-line max-statements
	constructor(token?: string) {
		const auth = token ?? process.env['GITHUB_TOKEN'];

		if (typeof auth === 'undefined')
			throw new Error(
				`GitHub authentication token is required. Specify it explicitly or use GITHUB_TOKEN environment variable.`,
			);

		this.octokit = new Octokit({ auth });

		const env = getOwnerRepoFromEnv();
		const git = getOwnerRepoFromGit();

		const repo = env.repo ?? git.repo;

		if (typeof repo === 'undefined') throw new Error(``);

		this.repo = repo;

		const owner = env.owner ?? getRepositoryOwnerFromEnvironment() ?? git.owner;

		if (typeof owner === 'undefined') throw new Error(``);

		this.owner = owner;
	}

	abstract delete(where: Partial<T>): Promise<void>;
	abstract get(where: Partial<T>): Promise<T | undefined>;
	abstract set(entity: Partial<T>): Promise<T>;
}

/**
 * Reads repository owner and name from `GITHUB_REPOSITORY` environment variable.
 */
export function getOwnerRepoFromEnv(): { owner?: string; repo?: string } {
	const [owner, repo] = (process.env['GITHUB_REPOSITORY'] ?? '').split('/');
	return { owner, repo };
}

/**
 * Attempts to derive repository owner and name from the local git remote.
 */
// eslint-disable-next-line max-statements
export function getOwnerRepoFromGit(): { owner?: string; repo?: string } {
	const remote = execSync('git remote get-url origin').toString().trim();

	const url = remote.replace(/\.git$/u, '');

	if (url.startsWith('git@')) {
		// Git@github.com:owner/repo
		const [, path] = url.split(':');
		const [owner, repo] = (path ?? '').split('/');
		return { owner, repo };
	}

	if (url.startsWith('http')) {
		// https://github.com/owner/repo
		const parts = url.split('/');
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const owner = parts.at(-2)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const repo = parts.at(-1)!;
		return { owner, repo };
	}

	return {};
}

function getRepositoryOwnerFromEnvironment(): string | undefined {
	return (
		process.env['GITHUB_REPOSITORY_OWNER'] ?? (process.env['GITHUB_REPOSITORY'] ?? '').split('/')[1]
	);
}
