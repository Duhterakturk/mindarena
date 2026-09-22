import json
import os
import shutil
import subprocess
from copy import deepcopy
from pathlib import Path

from flask import current_app


class IssueError(RuntimeError):
    pass


_BACKEND = Path(__file__).resolve().parents[2]
_FIXTURES = _BACKEND / "tests" / "fixtures" / "rounds.json"
_FRONTEND = _BACKEND.parent / "frontend"
_SCRIPT = _FRONTEND / "scripts" / "open-puzzle.mjs"
_ROUNDS = None


def issue(slug, difficulty):
    if current_app.config.get("TESTING"):
        puzzle = deepcopy(_fixture(slug))
        return puzzle, puzzle
    public, proof = _from_node(slug, difficulty)
    return public, proof


def _fixture(slug):
    global _ROUNDS
    if _ROUNDS is None:
        _ROUNDS = json.loads(_FIXTURES.read_text(encoding="utf-8"))
    if slug not in _ROUNDS:
        raise IssueError("Bulmaca açılamadı")
    return _ROUNDS[slug]["puzzle"]


def _from_node(slug, difficulty):
    runner = os.environ.get("PUZZLE_RUNNER")
    if runner:
        node = shutil.which("node")
        if node is None or not Path(runner).is_file():
            raise IssueError("Bulmaca üretici bulunamadı")
        command = [node, runner, slug, difficulty]
        cwd = None
    else:
        npx = shutil.which("npx")
        if npx is None or not _SCRIPT.exists():
            raise IssueError("Bulmaca üretici bulunamadı")
        command = [npx, "vite-node", str(_SCRIPT), slug, difficulty]
        cwd = _FRONTEND
    try:
        completed = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=90,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise IssueError("Bulmaca açılamadı") from exc
    if completed.returncode != 0 or not completed.stdout.strip():
        raise IssueError("Bulmaca açılamadı")
    text = completed.stdout
    start = text.find("{")
    try:
        payload = json.loads(text[start:] if start >= 0 else text)
        return payload["public"], payload["proof"]
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise IssueError("Bulmaca açılamadı") from exc
