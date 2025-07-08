// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "@react-native"],
  plugins: ["import"],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      alias: {
        map: [
          ["@", "./"],
          ["@/lib", "./lib"],
          ["@/components", "./components"],
          ["@/app", "./app"],
          ["@/assets", "./assets"],
          ["@/hooks", "./hooks"],
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  ignorePatterns: ["dist/*", "node_modules/*"],
  rules: {
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
  },
};
