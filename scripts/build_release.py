#!/usr/bin/env python3

import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VERSION = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
DIST = ROOT / "dist"
RELEASE_NAME = f"Knowledge-Contribution-Kit-{VERSION}"
STAGE = DIST / RELEASE_NAME

INCLUDE = [
    "README.md",
    "LICENSE",
    "SECURITY.md",
    "VERSION",
    "CHANGELOG.md",
    "SYNTHESIS-PROMPT.md",
    "index.html",
    "web",
]


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    STAGE.mkdir(parents=True)

    for relative_path in INCLUDE:
        source = ROOT / relative_path
        destination = STAGE / relative_path
        if source.is_dir():
            shutil.copytree(source, destination)
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    archive_path = DIST / f"{RELEASE_NAME}.zip"
    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(STAGE.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(DIST))

    shutil.copytree(STAGE, DIST / "site")
    print(f"Built {archive_path}")


if __name__ == "__main__":
    main()
