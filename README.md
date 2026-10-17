# Knowledge Contribution Kit

> **Large corpora provide breadth. The right teammates contribute judgment.**

## Why this exists

Large document collections can give an AI tool broad coverage, but they also
contain substantial noise. The practical judgment that makes a skill or agent
useful may sit with a small number of teammates who already do the work well,
often in private day-to-day context that should not simply be handed to the
builder.

Knowledge Contribution Kit gives builders one prompt shaped to the skill,
agent, tool, checklist, or guide they are building. They can send it to willing
teammates, who run it in their own approved AI environments and return one
reviewed document of generalized guidance without handing over the underlying
messages, email, or files.

> Before inviting contributors, sending a contribution, or using workplace
> data, have a human lawyer at your organization review the process,
> contribution, intended data use, and sharing plan.

## Use it

1. [Open the prompt builder](https://dvelton.github.io/knowledge-contribution-kit/).
2. Describe what you are building and where the contributor's AI can read it.
3. Generate and copy the contributor prompt.
4. Send it to a willing teammate together with the project file or full text
   unless their AI can access the current version directly.
5. The teammate runs it in their own approved AI environment, reviews the
   resulting document, obtains the required human legal review, and decides
   whether to send it back.

The page runs entirely in the browser. It does not upload or retain what the
builder enters.

The [latest release](https://github.com/dvelton/knowledge-contribution-kit/releases/latest)
also works from downloaded local files without a server.

## Why the prompt is shaped to what you are building

The generated prompt instructs the contributor's AI to:

- read the current version of the skill, agent, tool, checklist, or guide
  before searching workplace context;
- identify its existing domains, decision points, sources, boundaries, and
  output shape;
- search only sources the contributor explicitly approves;
- extract only the contributor's own knowledge;
- keep only guidance that would materially improve the project;
- compare every candidate with what the project already covers;
- preserve exceptions, disagreement, uncertainty, and possible staleness;
- remove identities, quotations, links, matter details, and confidential
  facts; and
- produce one focused Word document with suggested improvements and insertion
  points.

The prompt has no arbitrary candidate cap. It consolidates overlap, ranks the
five to ten strongest items in an executive summary, and includes every
distinct candidate that would materially improve the project. If none qualify,
it says so rather than padding the document.

## After contributions come back

The page also generates a short synthesis prompt. The builder can use it to
compare the returned contribution documents, identify overlap and
disagreement, validate candidates against maintained sources, and prepare a
change plan for the project being built.

Contributions are inputs for validation. Repetition does not turn a suggestion
into policy or authority.

## Limits

- A prompt cannot guarantee that a contribution is de-identified or
  appropriate to share.
- A hosted AI assistant processes information under the terms and settings
  that apply to that service. Confirm that the organization approves it for
  the proposed information.
- Contributors should approve the source scope before any search begins.
- Other people's statements may be used only for context and must not be
  extracted as the contributor's knowledge.
- Nothing should be sent or changed automatically.

## Development

Ordinary users do not need these commands.

```bash
npm install
npm test
npm run validate
npm run build
```

The project is distributed through GitHub and GitHub Releases, not npm.

## License

[MIT](LICENSE)
