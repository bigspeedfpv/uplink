module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["plugin:react/recommended", "airbnb", "airbnb-typescript", "prettier", "plugin:storybook/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    project: "frontend/tsconfig.json",
    tsConfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: ["react", "prettier"],
  rules: {}
};