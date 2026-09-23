import json

from app.extensions import db
from app.models import PuzzleAttempt
from tests.helpers import register_user


def _open(client, token, slug):
    return client.post(
        "/api/puzzles",
        json={"slug": slug, "difficulty": "easy"},
        headers={"Authorization": f"Bearer {token}"},
    )


def test_one_cell_stays_the_same_cell(client, student, app):
    opened = _open(client, student["token"], "sudoku")
    assert opened.status_code == 201
    body = opened.get_json()
    assert body["hint"] is None
    assert '"solution"' not in json.dumps(body)
    attempt_id = body["id"]

    with app.app_context():
        row = db.session.get(PuzzleAttempt, attempt_id)
        public = json.loads(row.public_json)
        proof = json.loads(row.proof_json)
    assert "solution" not in public
    solution = proof["solution"]

    headers = {"Authorization": f"Bearer {student['token']}"}
    first = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert first.status_code == 200, first.get_json()
    hint = first.get_json()["hint"]
    assert hint["kind"] == "fill"
    assert set(hint) <= {"kind", "row", "col", "value"}
    assert public["givens"][hint["row"]][hint["col"]] == 0
    assert solution[hint["row"]][hint["col"]] == hint["value"]

    second = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert second.status_code == 409
    assert second.get_json()["hint"] == hint


def test_cit_hint_is_one_edge(client, student):
    opened = _open(client, student["token"], "cit")
    assert opened.status_code == 201
    attempt_id = opened.get_json()["id"]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    hint = revealed.get_json()["hint"]
    assert hint["kind"] == "edge"
    assert hint["axis"] in ("h", "v")
    assert "horizontal" not in revealed.get_json()
    assert "vertical" not in revealed.get_json()


def test_numbers_hint_marks_where_one_sits(client, student, app):
    opened = _open(client, student["token"], "numbers")
    assert opened.status_code == 201
    body = opened.get_json()
    attempt_id = body["id"]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    hint = revealed.get_json()["hint"]
    assert hint == {"kind": "spot", "index": body["puzzle"]["values"].index(1), "value": 1}


def test_pentomino_hint_places_the_first_piece(client, student, app):
    opened = _open(client, student["token"], "pentominolar")
    assert opened.status_code == 201
    attempt_id = opened.get_json()["id"]
    with app.app_context():
        row = db.session.get(PuzzleAttempt, attempt_id)
        piece = json.loads(row.proof_json)["solution"]["placements"][0]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    assert revealed.get_json()["hint"] == {
        "kind": "piece",
        "name": piece["name"],
        "cells": piece["cells"],
    }


def test_patika_hint_is_the_step_after_one():
    from app.services.cell_hint import pick_hint

    public = {"fixedCells": {"0-0": "1", "0-3": "2", "2-3": "3", "2-0": "4"}}
    solution = {"cells": ["0-0", "0-1", "0-2", "0-3", "1-3", "2-3", "2-2", "2-1", "2-0"]}
    hint = pick_hint("patika", public, {"solution": solution})
    assert hint == {"kind": "mark", "row": 0, "col": 1, "note": "step", "label": "1"}


def test_abc_hint_draws_the_first_letter():
    from app.services.cell_hint import pick_hint

    public = {"fixedCells": {"0-0": "A", "0-3": "A", "2-0": "B", "2-3": "B"}}
    solution = {"cells": ["0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "2-2", "2-3"]}
    hint = pick_hint("abc-baglama", public, {"solution": solution})
    assert hint == {"kind": "marks", "cells": ["0-1", "0-2"], "label": "A"}


def test_colour_hint_follows_the_current_round(client, student, app):
    opened = _open(client, student["token"], "colours")
    assert opened.status_code == 201
    body = opened.get_json()
    attempt_id = body["id"]
    with app.app_context():
        row = db.session.get(PuzzleAttempt, attempt_id)
        choices = json.loads(row.proof_json)["solution"]["choices"]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", json={"round": 1}, headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    assert revealed.get_json()["hint"] == {"kind": "choice", "round": 1, "value": choices[1]}


def test_kakuro_hint_points_at_an_inner_cell():
    from app.services.cell_hint import pick_hint

    public = {"givens": [[0, 1], [2, 0]]}
    solution = [[None, None, None], [None, 4, 1], [None, 2, 3]]
    hint = pick_hint("kakuro", public, {"solution": solution})
    assert public["givens"][hint["row"]][hint["col"]] == 0
    inner = [row[1:] for row in solution[1:]]
    assert inner[hint["row"]][hint["col"]] == hint["value"]


def test_other_student_cannot_open_the_cell(client, student):
    opened = _open(client, student["token"], "sudoku")
    attempt_id = opened.get_json()["id"]
    other = register_user(client, email="other@example.com", role="student", grade_level=3)
    token = other.get_json()["access_token"]
    revealed = client.post(
        f"/api/puzzles/{attempt_id}/cell",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert revealed.status_code == 404
