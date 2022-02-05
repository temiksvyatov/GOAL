module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "google",
    ],
    rules: {
        quotes: ["error", "double"],
        indent: ["warn", 4],
    },
    parserOptions: {
        sourceType: "module",
    },
};
