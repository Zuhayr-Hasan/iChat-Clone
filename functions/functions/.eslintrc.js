module.exports = {
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    extends: ["eslint:recommended", "google"],
    rules: {
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        "quotes": ["error", "double", {allowTemplateLiterals: true}],
        "no-unused-vars": ["error", {varsIgnorePattern: "onRequest|context"}],
        "no-console": "off",
        "object-curly-spacing": ["error", "never"],
        "indent": ["error", 4],
        "no-multiple-empty-lines": ["error", {max: 2}],
    },
    overrides: [
        {
            files: ["**/*.spec.*"],
            env: {
                mocha: true,
            },
            rules: {},
        },
    ],
    globals: {},
};
