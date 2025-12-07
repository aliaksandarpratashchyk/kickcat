/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { RequestError } from 'octokit';
import { isUndefined } from 'underscore';

import type { Milestone } from '../Milestone';
import type { MilestoneState } from '../MilestoneState';

import nonNullable from '../nonNullable';
import GitHubEntityCollection from './GitHubEntityCollection';

/**
 * Milestone shape returned by GitHub REST API.
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
 * GitHub-backed collection for milestones.
 */
export default class GitHubMilestoneCollection extends GitHubEntityCollection<Milestone> {
	async delete(where: Partial<Milestone>): Promise<void> {
		await this.octokit.rest.issues.deleteMilestone({
			// eslint-disable-next-line camelcase
			milestone_number: nonNullable(where.number),
			owner: this.owner,
			repo: this.repo,
		});
	}

	async get(where: Partial<Milestone>): Promise<Milestone | undefined> {
		try {
			return toMilestone(
				(
					await this.octokit.rest.issues.getMilestone({
						// eslint-disable-next-line camelcase
						milestone_number: nonNullable(where.number),
						owner: this.owner,
						repo: this.repo,
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
		if (isUndefined(milestone.number)) {
			return toMilestone(
				(
					await this.octokit.rest.issues.createMilestone({
						description: milestone.description,
						// eslint-disable-next-line camelcase
						due_on: milestone.dueDate ?? '',
						owner: this.owner,
						repo: this.repo,
						state: milestone.state,
						title: nonNullable(milestone.title),
					})
				).data,
			);
		}

		return toMilestone(
			(
				await this.octokit.rest.issues.updateMilestone({
					description: milestone.description,
					// eslint-disable-next-line camelcase
					due_on: milestone.dueDate,
					// eslint-disable-next-line camelcase
					milestone_number: milestone.number,
					owner: this.owner,
					repo: this.repo,
					state: milestone.state,
					title: milestone.title,
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
