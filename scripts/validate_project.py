#!/usr/bin/env python3

import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "README.md",
    "LICENSE",
    "SECURITY.md",
    "SYNTHESIS-PROMPT.md",
    "index.html",
    "web/assets/generator.js",
    "web/assets/app.js",
    "web/assets/styles.css",
]

REMOVED_SURFACES = [
    "builder",
    "contributor",
    "docs",
    "eval",
    "examples",
    "governance",
    "schemas",
    "web/check.html",
    "web/guides.html",
]

SUSPICIOUS = {
    "local user path": re.compile(r"/(?:Users|home)/[A-Za-z0-9._-]+/"),
    "private Slack link": re.compile(r"https://[^/\s]+\.slack\.com/archives/", re.I),
    "local session artifact": re.compile(r"/session-state/[A-Za-z0-9-]+/", re.I),
}


def fail(message):
    print(f"ERROR: {message}")
    return 1


def check_files():
    errors = 0
    for relative in REQUIRED:
        path = ROOT / relative
        if not path.is_file() or path.stat().st_size == 0:
            errors += fail(f"Required file missing or empty: {relative}")
    for relative in REMOVED_SURFACES:
        path = ROOT / relative
        contains_files = path.is_file() or (
            path.is_dir() and any(candidate.is_file() for candidate in path.rglob("*"))
        )
        if contains_files:
            errors += fail(f"Removed complex surface still exists: {relative}")
    return errors


def check_versions():
    version = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    errors = 0
    if package["version"] != version:
        errors += fail("VERSION and package.json do not match")
    if f"## {version} " not in changelog:
        errors += fail("CHANGELOG does not contain the current version")
    return errors


def check_package_registry():
    lock = json.loads((ROOT / "package-lock.json").read_text(encoding="utf-8"))
    errors = 0
    for name, package in lock.get("packages", {}).items():
        resolved = package.get("resolved") if isinstance(package, dict) else None
        if resolved and urlparse(resolved).hostname != "registry.npmjs.org":
            errors += fail(f"Non-public package registry for {name}")
    return errors


def check_javascript():
    errors = 0
    for relative in [
        "web/assets/generator.js",
        "web/assets/app.js",
    ]:
        result = subprocess.run(
            ["node", "--check", str(ROOT / relative)],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode:
            errors += fail(f"JavaScript syntax error in {relative}")
    return errors


def check_html():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    errors = 0
    if re.search(r"""<(?:script|link)[^>]+(?:src|href)=["']https?://""", html, re.I):
        errors += fail("index.html loads a remote script or stylesheet")
    for href in re.findall(r"""(?:src|href)=["']([^"']+)["']""", html, re.I):
        href = href.split("#", 1)[0]
        if not href or href.startswith(("http://", "https://", "mailto:")):
            continue
        if not (ROOT / href).exists():
            errors += fail(f"Broken local link in index.html: {href}")
    return errors


def check_prompt_output():
    script = """
const g = require('./web/assets/generator.js');
const input = {
  projectName: 'Example project',
  projectType: 'agent',
  purpose: 'Help users do a defined task.',
  projectMaterials: 'Read the attached instructions.',
  preserve: 'Keep the current concise format.',
  focus: 'Operational exceptions.'
};
console.log(JSON.stringify({
  contribution: g.buildContributionPrompt(input),
  synthesis: g.buildSynthesisPrompt(input)
}));
"""
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        return fail("Prompt generator could not run")
    output = json.loads(result.stdout)
    errors = 0
    required = [
        "CONFIRM MY SOURCE SCOPE",
        "REVIEW EXAMPLE PROJECT FIRST",
        "KEEP ONLY CONTRIBUTIONS THAT IMPROVE EXAMPLE PROJECT",
        "COMPARE EVERY CANDIDATE WITH EXAMPLE PROJECT",
        "PROTECT PRIVATE AND SENSITIVE INFORMATION",
        "human lawyer at my organization",
    ]
    for phrase in required:
        if phrase.lower() not in output["contribution"].lower():
            errors += fail(f"Generated prompt missing: {phrase}")
    if "majority vote" not in output["synthesis"].lower():
        errors += fail("Synthesis prompt lacks disagreement control")
    return errors


def check_readme():
    text = (ROOT / "README.md").read_text(encoding="utf-8")
    word_count = len(re.findall(r"\b[\w'-]+\b", text))
    errors = 0
    if word_count > 1000:
        errors += fail(f"README is too long for the intended audience: {word_count} words")
    for phrase in [
        "one prompt",
        "willing teammate",
        "human lawyer at your organization",
        "does not upload or retain",
    ]:
        if phrase.lower() not in text.lower():
            errors += fail(f"README missing key concept: {phrase}")
    return errors


def check_public_content():
    errors = 0
    extensions = {".md", ".txt", ".html", ".js", ".json", ".yml", ".yaml", ".py"}
    for path in ROOT.rglob("*"):
        if (
            not path.is_file()
            or path.suffix.lower() not in extensions
            or any(part in {".git", "node_modules", "dist"} for part in path.parts)
        ):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for label, pattern in SUSPICIOUS.items():
            if pattern.search(text):
                errors += fail(f"Possible {label} in {path.relative_to(ROOT)}")
    return errors


def main():
    checks = [
        check_files,
        check_versions,
        check_package_registry,
        check_javascript,
        check_html,
        check_prompt_output,
        check_readme,
        check_public_content,
    ]
    errors = sum(check() for check in checks)
    if errors:
        print(f"Validation failed with {errors} error(s).")
        return 1
    print("Project validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
