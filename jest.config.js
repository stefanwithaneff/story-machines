module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules", "dist/"],
  collectCoverageFrom: ["src/**/!(index).ts"],
  coverageDirectory: "coverage/",
};
