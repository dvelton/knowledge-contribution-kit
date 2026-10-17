# Contributing

Changes should keep the project focused on one workflow:

1. a builder describes the skill, agent, tool, checklist, or guide;
2. the page generates a contributor prompt shaped to that project; and
3. the page provides a synthesis prompt for returned documents.

Do not add workplace connectors, accounts, uploads, analytics, dashboards,
employee assessment, or unsupported privacy, security, legal, or reliability
claims.

Use only fictional or public information in issues, tests, and pull requests.

Before opening a pull request:

```bash
npm install
npm test
npm run validate
npm run build
```
