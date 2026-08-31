import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  // Design handoff mockups (loose .jsx, not part of the app build).
  { ignores: ["handoff/**", "manual/**"] },
  ...nextConfig,
];

export default eslintConfig;
