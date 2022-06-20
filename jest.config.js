module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules", "dist/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/index.ts"],
  coverageDirectory: "coverage/",
};
