import js from '@eslint/js';

const nodeGlobals = {
    process: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
};

const browserGlobals = {
    document: 'readonly',
    window: 'readonly',
    fetch: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
};

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: { ecmaVersion: 2022 },
        rules: {
            complexity: ['error', 6],
            'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
            'max-lines': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
            'max-params': ['error', 4],
            'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
            'no-var': 'error',
            'prefer-const': 'error',
        },
    },
    {
        files: ['src/**/*.js', 'test/**/*.js', 'eslint.config.js'],
        languageOptions: { sourceType: 'module', globals: nodeGlobals },
    },
    {
        files: ['public/**/*.js'],
        languageOptions: { sourceType: 'script', globals: browserGlobals },
    },
    {
        files: ['test/**/*.js'],
        rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' },
    },
];
