/**
 * KickCat v0.1.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under GNU GPL v3 + No AI Use Clause (see LICENSE)
 */

import { Octokit, RequestError } from 'octokit';

import type { Milestone } from './Milestone';
import type { MilestoneState } from './MilestoneState';

export interface GitHubMilestone {
	[key: string]: unknown;
	description: null | string;
	due_on: null | string;
	number: number;
	state: MilestoneState;
	title: string;
}

export interface GitHubMilestoneOptions {
	owner: string;
	repo: string;
	token: string;
}

export default class GitHubMilestoneStorage {
	public readonly options: GitHubMilestoneOptions;
	readonly #octokit: Octokit;

	constructor(options: GitHubMilestoneOptions) {
		this.options = options;
		this.#octokit = new Octokit({ auth: this.options.token });
	}

	async find(number: number): Promise<Milestone | undefined> {
		try {
			return toMilestone(
				(
					await this.#octokit.rest.issues.getMilestone({
						// eslint-disable-next-line camelcase
						milestone_number: number,
						owner: this.options.owner,
						repo: this.options.repo,
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

	async save(milestone: Milestone): Promise<Milestone> {
		return toMilestone(
			(
				await this.#octokit.rest.issues.createMilestone({
					owner: this.options.owner,
					repo: this.options.repo,
					...milestone,
					description: milestone.description ?? '',
					// eslint-disable-next-line camelcase
					due_on: milestone.dueDate ?? '',
				})
			).data,
		);
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
