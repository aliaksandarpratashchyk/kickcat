const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: 'node',
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['json-summary', 'text'],
	coverageProvider: 'v8',
	transform: {
		...tsJestTransformCfg,
	},
};
