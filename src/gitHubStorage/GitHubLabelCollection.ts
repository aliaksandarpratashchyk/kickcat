/**
 * KickCat v0.5.0
 * Copyright (c) 2025 Aliaksandar Pratashchyk <aliaksandarpratashchyk@gmail.com>
 * Licensed under MIT (see LICENSE)
 */

import { isNull, isUndefined } from 'underscore';

import type { Label } from '../Label';

import nonNullable from '../nonNullable';
import GitHubEntityCollection from './GitHubEntityCollection';

/**
 * Label shape returned by GitHub REST API.
 */
export interface GitHubLabel {
	[key: string]: unknown;
	color: string;
	description: null | string;
	name: string;
}

/**
 * GitHub-backed collection for labels.
 */
export default class GitHubLabelCollection extends GitHubEntityCollection<Label> {
	async delete(where: Partial<Label>): Promise<void> {
		this.logger.debug(
			`GitHub labels.deleteLabel: ${this.owner}/${this.repo} name="${nonNullable(where.name)}"`,
		);
		await this.octokit.rest.issues.deleteLabel({
			name: nonNullable(where.name),
			owner: this.owner,
			repo: this.repo,
		});
	}

	async get(where: Partial<Label>): Promise<Label | undefined> {
		this.logger.debug(
			`GitHub labels.getLabel: ${this.owner}/${this.repo} name="${nonNullable(where.name)}"`,
		);
		try {
			return toLabel(
				(
					await this.octokit.rest.issues.getLabel({
						name: nonNullable(where.name),
						owner: this.owner,
						repo: this.repo,
					})
				).data,
			);
		} catch (error) {
			const status = getRequestStatus(error);
			if (status === 404) {
				this.logger.debug(
					`GitHub labels.getLabel returned 404: ${this.owner}/${this.repo} name="${nonNullable(where.name)}"`,
				);
				// eslint-disable-next-line no-undefined
				return undefined;
			}

			throw error;
		}
	}

	async set(label: Partial<Label>): Promise<Label> {
		const existing = await this.get(label);

		if (isUndefined(existing)) {
			this.logger.debug(
				`GitHub labels.createLabel: ${this.owner}/${this.repo} name="${nonNullable(label.name)}"`,
			);
			return toLabel(
				(
					await this.octokit.rest.issues.createLabel({
						color: label.color,
						description: label.description,
						name: nonNullable(label.name),
						owner: this.owner,
						repo: this.repo,
					})
				).data,
			);
		}

		this.logger.debug(
			`GitHub labels.updateLabel: ${this.owner}/${this.repo} name="${nonNullable(label.name)}"`,
		);
		return toLabel(
			(
				await this.octokit.rest.issues.updateLabel({
					color: label.color,
					description: label.description,
					name: nonNullable(label.name),
					owner: this.owner,
					repo: this.repo,
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

function toLabel(gitHubLabel: GitHubLabel): Label {
	const label: Label = {
		color: gitHubLabel.color,
		name: gitHubLabel.name,
	};

	if (!isNull(gitHubLabel.description)) label.description = gitHubLabel.description;

	return label;
}
