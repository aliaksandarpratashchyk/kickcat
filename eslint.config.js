const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const { importX } = require('eslint-plugin-import-x');
const { createTypeScriptImportResolver } = require('eslint-import-resolver-typescript');
const perfectionist = require('eslint-plugin-perfectionist');
const eslintConfigPrettierFlat = require('eslint-config-prettier/flat');
const pluginJest = require('eslint-plugin-jest');

module.exports = defineConfig(
	{
		ignores: ['dist/'],
	},
	{
		files: ['src/**/*.ts'],
		extends: [
			eslint.configs.all,
			tseslint.configs.all,
			importX.flatConfigs.errors,
			importX.flatConfigs.warnings,
			importX.flatConfigs.typescript,
			{
				settings: {
					'import-x/resolver-next': [
						createTypeScriptImportResolver({
							alwaysTryTypes: true,
							bun: true,
							project: 'tsconfig.json',
						}),
					],
				},
			},
			process.env.ESLINT_ENV === 'cli' ? perfectionist.configs['recommended-natural'] : {},
			eslintConfigPrettierFlat,
			{
				rules: {
					'capitalized-comments': [
						'error',
						'always',
						{
							ignoreConsecutiveComments: true,
							ignoreInlineComments: true,
						},
					],
					'func-style': ['error', 'declaration', { allowTypeAnnotation: true }],
					'id-length': ['error', { exceptions: ['p', 'x', 'y'] }],
					'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
					'max-statements': ['error', 10, { ignoreTopLevelFunctions: true }],
					'one-var': 'off',
					'no-plusplus': 'off',
					'no-ternary': 'off',					
					'no-void': ['error', { allowAsStatement: true }],
					'operator-assignment': 'off', // fix
					'sort-imports': 'off', // fix
					'sort-keys': 'off', // fix
					'@typescript-eslint/explicit-member-accessibility': 'off',
					'@typescript-eslint/member-ordering': 'off', // fix
					'@typescript-eslint/naming-convention': [
						'error',
						{ selector: 'enumMember', format: ['PascalCase'] },
					],
					'@typescript-eslint/no-import-type-side-effects': 'off', // fix
					'@typescript-eslint/no-magic-numbers': 'off',
					'@typescript-eslint/no-use-before-define': 'off',
					'@typescript-eslint/prefer-destructuring': 'off', // fix
					'@typescript-eslint/prefer-readonly-parameter-types': 'off',
				},
			},
		],
	},
	{
		files: ['src/**/*.spec.ts', 'e2e/**/*.spec.ts'],
		plugins: { jest: pluginJest },
		languageOptions: {
			globals: pluginJest.environments.globals.globals,
		},
		rules: {
			'id-length': 'off',
			'max-lines-per-function': 'off',
			'max-statements': 'off',
			'no-magic-numbers': 'off',
			'no-undefined': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off'
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
	},
);
