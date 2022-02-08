/* eslint-disable quote-props */
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
        "max-len": ["warn", 160],
    },
    parserOptions: {
        sourceType: "module",
    },
};
