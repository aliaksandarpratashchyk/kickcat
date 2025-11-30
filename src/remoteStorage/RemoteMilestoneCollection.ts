/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { Octokit, RequestError } from 'octokit';

import type { Milestone } from '../Milestone';
import type { MilestoneState } from '../MilestoneState';
import { execSync } from 'node:child_process';
import { inject, singleton } from 'tsyringe';
import nonNullable from '../nonNullable';

export interface GitHubMilestone {
	[key: string]: unknown;
	description: null | string;
	due_on: null | string;
	number: number;
	state: MilestoneState;
	title: string;
}

export interface GitHubMilestoneOptions {
	owner?: string;
	repo?: string;
	token?: string;
}

function getRepositoryOwnerFromEnvironment(): string | undefined {
	return process.env['GITHUB_REPOSITORY_OWNER'] ??
		(process.env['GITHUB_REPOSITORY'] ?? '').split('/')[1];
}

export function getOwnerRepoFromEnv(): { owner?: string; repo?: string } {
	const [owner, repo] = (process.env['GITHUB_REPOSITORY'] ?? '').split('/');
	return { owner, repo };
}

// eslint-disable-next-line max-statements
export function getOwnerRepoFromGit(): { owner?: string; repo?: string } {
	const remote = execSync("git remote get-url origin").toString().trim();

	const url = remote.replace(/\.git$/u, "");

	if (url.startsWith("git@")) {
		// Git@github.com:owner/repo
		const [, path] = url.split(":");
		const [owner, repo] = (path ?? '').split("/");
		return { owner, repo };
	}

	if (url.startsWith("http")) {
		// https://github.com/owner/repo
		const parts = url.split("/");
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const owner = parts.at(-2)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const repo = parts.at(-1)!;
		return { owner, repo };
	}

	return {};
}

@singleton()
export default class RemoteMilestoneCollection {
	readonly #octokit: Octokit;
	readonly #repo: string;
	readonly #owner: string;

	// eslint-disable-next-line max-statements
	constructor(@inject('GitHubToken') token?: string) {
		const auth = token ?? process.env['GITHUB_TOKEN'];

		if (typeof auth === 'undefined')
			throw new Error(`GitHub authentication token is required. Specify it explicitly or use GITHUB_TOKEN environment variable.`);

		this.#octokit = new Octokit({ auth });

		const env = getOwnerRepoFromEnv();
		const git = getOwnerRepoFromGit();

		const repo = env.repo ?? git.repo;

		if (typeof repo === 'undefined')
			throw new Error(``);

		this.#repo = repo;

		const owner = env.owner ?? getRepositoryOwnerFromEnvironment() ?? git.owner;

		if (typeof owner === 'undefined')
			throw new Error(``);

		this.#owner = owner;
	}	

	async *[Symbol.asyncIterator](): AsyncIterator<Milestone> {
		try {
			const milestones = await this.#octokit.paginate(
				this.#octokit.rest.issues.listMilestones,
				{
					owner: this.#owner,
					repo: this.#repo,
					// eslint-disable-next-line camelcase
					per_page: 100,
					state: 'all',
				},
			);

			for (const milestone of milestones)
				yield toMilestone(milestone);
		} catch (error) {
			if (error instanceof RequestError && error.status === 404)				
				return;

			throw error;
		}
	}

	async get(where: Partial<Milestone>): Promise<Milestone | undefined> {
		try {
			return toMilestone(
				(
					await this.#octokit.rest.issues.getMilestone({
						// eslint-disable-next-line camelcase
						milestone_number: nonNullable(where.number),
						owner: this.#owner,
						repo: this.#repo,
					})
				).data,
			);
		} catch (error) {
			if (error instanceof RequestError && error.status === 404)
				// eslint-disable-next-line no-undefined
				return undefined;

			throw error;
		}
	}

	async set(milestone: Partial<Milestone>): Promise<Milestone> {
		return toMilestone(
			(
				await this.#octokit.rest.issues.createMilestone({
					owner: this.#owner,
					repo: this.#repo,
					...milestone,
					title: nonNullable(milestone.title),
					description: milestone.description ?? '',
					// eslint-disable-next-line camelcase
					due_on: milestone.dueDate ?? '',
				})
			).data,
		);
	}

	async delete(where: Partial<Milestone>): Promise<void> {
		await this.#octokit.rest.issues.deleteMilestone({
			owner: this.#owner,
			repo: this.#repo,
			// eslint-disable-next-line camelcase
			milestone_number: nonNullable(where.number)
		});
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await
	async commit(): Promise<void> {
		throw new Error(``);
	}
}

function toMilestone(gitHubMilestone: GitHubMilestone): Milestone {
	const milestone: Milestone = {
		number: gitHubMilestone.number,
		state: gitHubMilestone.state,
		title: gitHubMilestone.title,
	};

	if (gitHubMilestone.description !== null) milestone.description = gitHubMilestone.description;
	if (gitHubMilestone.due_on !== null) milestone.dueDate = gitHubMilestone.due_on;

	return milestone;
}
