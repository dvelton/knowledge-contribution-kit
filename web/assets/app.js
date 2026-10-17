(function () {
  "use strict";

  const form = document.querySelector("#prompt-form");
  const emptyResult = document.querySelector("#empty-result");
  const generatedResult = document.querySelector("#generated-result");
  const promptOutput = document.querySelector("#prompt-output");
  const synthesisOutput = document.querySelector("#synthesis-output");
  let generatedPrompt = "";
  let generatedSynthesis = "";
  let generatedName = "knowledge-contribution";

  function formValues() {
    return {
      projectName: document.querySelector("#project-name").value.trim(),
      projectType: document.querySelector("#project-type").value,
      purpose: document.querySelector("#project-purpose").value.trim(),
      projectMaterials: document.querySelector("#project-materials").value.trim(),
      preserve: document.querySelector("#preserve-behavior").value.trim(),
      focus: document.querySelector("#contributor-focus").value.trim()
    };
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70) || "knowledge-contribution";
  }

  async function copyText(text, button) {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (_error) {
        copied = false;
      }
    }

    if (!copied) {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      copied = document.execCommand("copy");
      helper.remove();
    }

    const original = button.textContent;
    button.textContent = copied ? "Copied" : "Select and copy manually";
    document.querySelector("#copy-status").textContent = copied
      ? `${original} copied to the clipboard.`
      : "Automatic copying was unavailable. Select and copy the text manually.";
    window.setTimeout(() => {
      button.textContent = original;
      document.querySelector("#copy-status").textContent = "";
    }, copied ? 1200 : 2400);
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = formValues();
    generatedPrompt =
      KnowledgePromptGenerator.buildContributionPrompt(values);
    generatedSynthesis =
      KnowledgePromptGenerator.buildSynthesisPrompt(values);
    generatedName = slugify(values.projectName);

    promptOutput.textContent = generatedPrompt;
    synthesisOutput.textContent = generatedSynthesis;
    emptyResult.hidden = true;
    generatedResult.hidden = false;
    document.querySelector("#result-card").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    promptOutput.focus({ preventScroll: true });
  });

  document.querySelector("#copy-prompt").addEventListener("click", (event) => {
    copyText(generatedPrompt, event.currentTarget);
  });

  document
    .querySelector("#download-prompt")
    .addEventListener("click", () => {
      downloadText(
        `${generatedName}-contributor-prompt.txt`,
        generatedPrompt
      );
    });

  document
    .querySelector("#copy-synthesis")
    .addEventListener("click", (event) => {
      copyText(generatedSynthesis, event.currentTarget);
    });

  document
    .querySelector("#download-synthesis")
    .addEventListener("click", () => {
      downloadText(
        `${generatedName}-synthesis-prompt.txt`,
        generatedSynthesis
      );
    });

  document.querySelector("#start-over").addEventListener("click", () => {
    form.reset();
    generatedPrompt = "";
    generatedSynthesis = "";
    promptOutput.textContent = "";
    synthesisOutput.textContent = "";
    generatedResult.hidden = true;
    emptyResult.hidden = false;
    document.querySelector("#project-name").focus();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
