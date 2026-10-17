# Contribution synthesis prompt

The website generates a version populated with the project name, purpose, and
location.

The synthesis prompt tells the builder's AI to:

- read the current version of the project and the reviewed contribution
  documents;
- ask before searching any additional maintained source;
- avoid contacting anyone, sending messages, or modifying files;
- screen out identities, quotations, private links, and matter details;
- avoid attributing candidates to individual contributors;
- preserve package-level disagreement and uncertainty;
- deduplicate overlapping candidates without majority voting;
- validate material candidates against maintained sources or responsible
  owners;
- reject stale, unsupported, overbroad, or matter-specific suggestions;
- identify precise proposed changes and insertion points; and
- prepare a change plan before modifying the project; and
- require human lawyer review before any change is made.
