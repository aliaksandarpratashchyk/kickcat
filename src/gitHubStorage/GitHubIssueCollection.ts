/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { difference, isNumber, isString, isUndefined } from 'underscore';

import type { Issue } from '../Issue';

import { isIssueState } from '../IssueState';
import nonNullable from '../nonNullable';
import GitHubEntityCollection from './GitHubEntityCollection';

/**
 * Issue shape returned by GitHub REST API.
 */
export interface GitHubIssue {
	[key: string]: unknown;
	body?: null | string;
	labels?: unknown[];
	milestone?: null | { number?: unknown; title?: unknown };
	number: number;
	state: string;
	title: string;
}

/**
 * GitHub-backed collection for issues.
 */
export default class GitHubIssueCollection extends GitHubEntityCollection<Issue> {
	// eslint-disable-next-line @typescript-eslint/class-methods-use-this, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
	async delete(_where: Partial<Issue>): Promise<void> {
		throw new Error(`Not supported.`);
	}

	async get(where: Partial<Issue>): Promise<Issue | undefined> {
		this.logger.debug(
			`GitHub issues.get: ${this.owner}/${this.repo} issue_number=${nonNullable(where.number)}`,
		);
		try {
			const issue = toIssue(
				(
					await this.octokit.rest.issues.get({
						// eslint-disable-next-line camelcase
						issue_number: nonNullable(where.number),
						owner: this.owner,
						repo: this.repo,
					})
				).data,
			);

			return issue;
		} catch (error) {
			const status = getRequestStatus(error);
			if (!isUndefined(status) && [301, 404, 410].includes(status)) {
				this.logger.debug(
					`GitHub issues.get returned ${status}: ${this.owner}/${this.repo} issue_number=${nonNullable(where.number)}`,
				);
				// eslint-disable-next-line no-undefined
				return undefined;
			}

			throw error;
		}
	}

	// eslint-disable-next-line max-statements, max-lines-per-function
	async set(issue: Partial<Issue>): Promise<Issue> {
		// eslint-disable-next-line no-useless-assignment
		let returned: Issue | null = null;

		let milestoneNumber: number | undefined;

		if (isNumber(issue.milestone)) milestoneNumber = issue.milestone;

		if (typeof issue.milestone === 'string') {
			this.logger.debug(
				`GitHub issues.getMilestoneByTitle: ${this.owner}/${this.repo} title="${issue.milestone}"`,
			);
			const normalize = (value: string): string =>
				value
					.toLowerCase()
					.replaceAll('&', 'and')
					.replaceAll(/[^a-z0-9]+/gu, ' ')
					.trim();

			const candidate = issue.milestone;

			const milestones = (
				await this.octokit.rest.issues.listMilestones({
					owner: this.owner,
					repo: this.repo,
					state: 'all',
				})
			).data;

			const milestone =
				milestones.find((mil) => mil.title === candidate) ??
				milestones.find((mil) => normalize(mil.title) === normalize(candidate));

			if (milestone) {
				milestoneNumber = milestone.number;
			} else {
				this.logger.debug(`Milestone "${issue.milestone}" not found.`);
			}
		}

		if (isUndefined(issue.number)) {
			this.logger.debug(
				`GitHub issues.create: ${this.owner}/${this.repo} title="${nonNullable(issue.title)}"`,
			);
			returned = toIssue(
				(
					await this.octokit.rest.issues.create({
						body: issue.description,
						labels: issue.labels,
						...(isNumber(milestoneNumber) ? { milestone: milestoneNumber } : {}),
						owner: this.owner,
						repo: this.repo,
						title: nonNullable(issue.title),
					})
				).data,
			);
		} else {
			this.logger.debug(
				`GitHub issues.update: ${this.owner}/${this.repo} issue_number=${issue.number}`,
			);
			returned = toIssue(
				(
					await this.octokit.rest.issues.update({
						body: issue.description,
						// eslint-disable-next-line camelcase
						issue_number: issue.number,
						labels: issue.labels,
						...(isNumber(milestoneNumber) ? { milestone: milestoneNumber } : {}),
						owner: this.owner,
						repo: this.repo,
						title: nonNullable(issue.title),
					})
				).data,
			);
		}

		const saved = nonNullable(returned);

		const issueNumber = saved.number;

		if (isNumber(issueNumber)) {
			this.logger.debug(
				`GitHub issue dependencies sync: ${this.owner}/${this.repo} issue_number=${issueNumber}`,
			);
			const newDependencies = await this.#getIssueIds(issue.dependencies?.filter(isNumber) ?? []);
			const oldDependencyIds = await this.#getAllDependencyIds(issueNumber);

			const dependenciesToAdd = difference(newDependencies, oldDependencyIds);
			await this.#addDependencies(issueNumber, dependenciesToAdd);

			const dependenciesToDelete = difference(oldDependencyIds, newDependencies);
			await this.#deleteDependencies(issueNumber, dependenciesToDelete);
		} else {
			this.logger.debug(
				`GitHub issue dependencies sync skipped: ${this.owner}/${this.repo} (issue number missing)`,
			);
		}

		return saved;
	}

	async #addDependencies(issueNumber: number, dependencyIds: number[]): Promise<void> {
		this.logger.debug(
			`GitHub issues.addBlockedByDependency: ${this.owner}/${this.repo} issue_number=${issueNumber} count=${dependencyIds.length}`,
		);
		await Promise.all(
			dependencyIds.map(async (dependency) =>
				this.octokit.rest.issues.addBlockedByDependency({
					// eslint-disable-next-line camelcase
					issue_id: dependency,
					// eslint-disable-next-line camelcase
					issue_number: issueNumber,
					owner: this.owner,
					repo: this.repo,
				}),
			),
		);
	}

	async #deleteDependencies(issueNumber: number, dependencyIds: number[]): Promise<void> {
		this.logger.debug(
			`GitHub issues.removeDependencyBlockedBy: ${this.owner}/${this.repo} issue_number=${issueNumber} count=${dependencyIds.length}`,
		);
		await Promise.all(
			dependencyIds.map(async (dependency) =>
				this.octokit.rest.issues.removeDependencyBlockedBy({
					// eslint-disable-next-line camelcase
					issue_id: dependency,
					// eslint-disable-next-line camelcase
					issue_number: issueNumber,
					owner: this.owner,
					repo: this.repo,
				}),
			),
		);
	}

	async #getAllDependencyIds(issueNumber: number): Promise<number[]> {
		this.logger.debug(
			`GitHub issues.listDependenciesBlockedBy: ${this.owner}/${this.repo} issue_number=${issueNumber}`,
		);
		const dependencyIds: number[] = [];
		let page = 1;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			 
			const issues = (
				// eslint-disable-next-line no-await-in-loop
				await this.octokit.rest.issues.listDependenciesBlockedBy({
					// eslint-disable-next-line camelcase
					issue_number: nonNullable(issueNumber),
					owner: this.owner,
					page,
					// eslint-disable-next-line camelcase
					per_page: 100,
					repo: this.repo,
				})
			).data;

			for (const issue of issues) dependencyIds.push(issue.id);

			page += 1;

			if (issues.length < 100) break;
		}

		return dependencyIds;
	}

	async #getIssueIds(issueNumbers: number[]): Promise<number[]> {
		this.logger.debug(
			`GitHub issues.get (dependencies): ${this.owner}/${this.repo} count=${issueNumbers.length}`,
		);
		const issues = await Promise.all(
			issueNumbers.map(async (issueNumber) => {
				try {
					return (
						await this.octokit.rest.issues.get({
							// eslint-disable-next-line camelcase
							issue_number: issueNumber,
							owner: this.owner,
							repo: this.repo,
						})
					).data.id;
				} catch (error) {
					const status = getRequestStatus(error);
					if (!isUndefined(status) && [301, 404, 410].includes(status)) return null;

					throw error;
				}
			}),
		);

		return Array.from(new Set(issues.filter(isNumber)));
	}
}

function getRequestStatus(error: unknown): number | undefined {
	// eslint-disable-next-line no-undefined
	if (typeof error !== 'object' || error === null) return undefined;
	// eslint-disable-next-line no-undefined
	if (!('status' in error)) return undefined;
	const { status } = error as { status?: unknown };
	// eslint-disable-next-line no-undefined
	return typeof status === 'number' ? status : undefined;
}

function toIssue(gitHubIssue: GitHubIssue): Issue {
	const issue: Issue = {
		number: gitHubIssue.number,
		title: gitHubIssue.title,
	};

	if (isString(gitHubIssue.body)) issue.description = gitHubIssue.body;

	if (Array.isArray(gitHubIssue.labels)) {
		const labels = gitHubIssue.labels
			.map((label) => {
				if (isString(label)) return label;
				if (typeof label === 'object' && label !== null && 'name' in label) {
					const { name } = label as { name?: unknown };
					return isString(name) ? name : null;
				}
				return null;
			})
			.filter(isString);

		if (labels.length > 0) issue.labels = labels;
	}

	if (typeof gitHubIssue.milestone === 'object' && gitHubIssue.milestone !== null) {
		const { number } = gitHubIssue.milestone;
		if (isNumber(number)) issue.milestone = number;
	}

	if (isIssueState(gitHubIssue.state)) issue.state = gitHubIssue.state;

	return issue;
}
