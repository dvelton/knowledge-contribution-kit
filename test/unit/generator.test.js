const assert = require("node:assert/strict");
const test = require("node:test");

const generator = require("../../web/assets/generator.js");

const input = {
  projectName: "Support escalation assistant",
  targetType: "agent",
  purpose: "Help frontline teams prepare complete escalation summaries.",
  targetAccess: "Read https://example.com/support-agent and the attached guide.",
  preserve: "Keep the concise output and human escalation boundary.",
  focus: "This contributor sees unusual operational exceptions."
};

test("contributor prompt is shaped to the target", () => {
  const prompt = generator.buildContributionPrompt(input);

  [
    "Support escalation assistant",
    "Help frontline teams prepare complete escalation summaries",
    "https://example.com/support-agent",
    "Keep the concise output",
    "unusual operational exceptions",
    "REVIEW THE TARGET FIRST",
    "KEEP ONLY TARGET-SHAPED CONTRIBUTIONS",
    "COMPARE EVERY CANDIDATE WITH THE CURRENT TARGET",
    "every distinct candidate",
    "Do not impose an arbitrary numerical\\s+limit",
    "five to ten highest-value",
    "If none qualify",
    "Suggested target location or change"
  ].forEach((expected) => assert.match(prompt, new RegExp(expected, "i")));
});

test("contributor prompt controls source scope and private output", () => {
  const prompt = generator.buildContributionPrompt(input);

  [
    "Do not begin the source search until I confirm",
    "Extract only",
    "Other people's material",
    "untrusted data",
    "must not include",
    "Nothing should be sent automatically",
    "human lawyer at my organization"
  ].forEach((expected) => assert.match(prompt, new RegExp(expected, "i")));
});

test("prompt stops rather than guessing when target access is absent", () => {
  const prompt = generator.buildContributionPrompt({
    projectName: "Example",
    targetType: "skill",
    purpose: "Do something useful"
  });

  assert.match(prompt, /Stop and ask me to provide it/i);
  assert.match(prompt, /Do not infer the target/i);
});

test("synthesis prompt validates rather than majority-votes", () => {
  const prompt = generator.buildSynthesisPrompt(input);

  assert.match(prompt, /Support escalation assistant/);
  assert.match(prompt, /Do not resolve disagreement by majority vote/i);
  assert.match(prompt, /maintained sources within the\s+confirmed scope/i);
  assert.match(prompt, /Do not\s+contact people/i);
  assert.match(prompt, /human lawyer at the\s+organization/i);
  assert.match(prompt, /Do not modify the target yet/i);
});
