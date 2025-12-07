/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { RequestError } from 'octokit';
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
	issue_number?: number;
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
			if (error instanceof RequestError && [301, 404, 410].includes(error.status))
				// eslint-disable-next-line no-undefined
				return undefined;

			throw error;
		}
	}

	// eslint-disable-next-line max-statements
	async set(issue: Partial<Issue>): Promise<Issue> {
		// eslint-disable-next-line no-useless-assignment
		let returned: Issue | null = null;

		if (isUndefined(issue.number)) {
			returned = toIssue(
				(
					await this.octokit.rest.issues.create({
						description: issue.description,
						labels: issue.labels,
						milestone: issue.milestone,
						owner: this.owner,
						repo: this.repo,
						title: nonNullable(issue.title),
					})
				).data,
			);
		} else {
			returned = toIssue(
				(
					await this.octokit.rest.issues.update({
						body: issue.description,
						// eslint-disable-next-line camelcase
						issue_number: issue.number,
						labels: issue.labels,
						milestone: issue.milestone,
						owner: this.owner,
						repo: this.repo,
						title: nonNullable(issue.title),
					})
				).data,
			);
		}

		const newDependencies = await this.#getIssueIds(issue.dependencies?.filter(isNumber) ?? []);
		const oldDependencyIds = await this.#getAllDependencyIds(nonNullable(issue.number));

		const dependenciesToAdd = difference(newDependencies, oldDependencyIds);
		await this.#addDependencies(nonNullable(issue.number), dependenciesToAdd);

		const dependenciesToDelete = difference(oldDependencyIds, newDependencies);
		await this.#deleteDependencies(nonNullable(issue.number), dependenciesToDelete);

		return returned;
	}

	async #addDependencies(issueNumber: number, dependencyIds: number[]): Promise<void> {
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
					if (error instanceof RequestError && [301, 404, 410].includes(error.status)) return null;

					throw error;
				}
			}),
		);

		return Array.from(new Set(issues.filter(isNumber)));
	}
}

function toIssue(gitHubIssue: GitHubIssue): Issue {
	const issue: Issue = {
		number: gitHubIssue.issue_number,
		title: gitHubIssue.title,
	};

	if (isString(gitHubIssue.body)) issue.description = gitHubIssue.body;

	if (isIssueState(gitHubIssue.state)) issue.state = gitHubIssue.state;

	return issue;
}
