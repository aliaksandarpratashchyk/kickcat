/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

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
		this.logger.debug(
			`GitHub issues.deleteMilestone: ${this.owner}/${this.repo} milestone_number=${nonNullable(where.number)}`,
		);
		await this.octokit.rest.issues.deleteMilestone({
			// eslint-disable-next-line camelcase
			milestone_number: nonNullable(where.number),
			owner: this.owner,
			repo: this.repo,
		});
	}

	async get(where: Partial<Milestone>): Promise<Milestone | undefined> {
		this.logger.debug(
			`GitHub issues.getMilestone: ${this.owner}/${this.repo} milestone_number=${nonNullable(where.number)}`,
		);
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
			const status = getRequestStatus(error);
			if (status === 404) {
				this.logger.debug(
					`GitHub issues.getMilestone returned 404: ${this.owner}/${this.repo} milestone_number=${nonNullable(where.number)}`,
				);
				// eslint-disable-next-line no-undefined
				return undefined;
			}

			throw error;
		}
	}

	async set(milestone: Partial<Milestone>): Promise<Milestone> {
		if (isUndefined(milestone.number)) {
			this.logger.debug(
				`GitHub issues.createMilestone: ${this.owner}/${this.repo} title="${nonNullable(milestone.title)}"`,
			);
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

		this.logger.debug(
			`GitHub issues.updateMilestone: ${this.owner}/${this.repo} milestone_number=${milestone.number}`,
		);
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

function getRequestStatus(error: unknown): number | undefined {
	if (typeof error !== 'object' || error === null) return undefined;
	if (!('status' in error)) return undefined;
	const { status } = error as { status?: unknown };
	return typeof status === 'number' ? status : undefined;
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
