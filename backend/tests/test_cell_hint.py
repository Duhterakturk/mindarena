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


def test_hints_spend_a_balance_and_a_solve_earns_one(client, student, app):
    opened = _open(client, student["token"], "sudoku")
    assert opened.status_code == 201
    body = opened.get_json()
    assert body["hint"] is None
    assert body["hint_balance"] == 3
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
    assert first.get_json()["hint_balance"] == 2
    assert hint["kind"] == "fill"
    assert set(hint) <= {"kind", "row", "col", "value"}
    assert public["givens"][hint["row"]][hint["col"]] == 0
    assert solution[hint["row"]][hint["col"]] == hint["value"]

    second = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert second.status_code == 200, second.get_json()
    assert second.get_json()["hint_balance"] == 1
    assert (second.get_json()["hint"]["row"], second.get_json()["hint"]["col"]) != (hint["row"], hint["col"])

    third = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert third.status_code == 200
    assert third.get_json()["hint_balance"] == 0
    blocked = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert blocked.status_code == 409

    checked = client.post(
        f"/api/puzzles/{attempt_id}/check",
        headers=headers,
        json={"answer": solution},
    )
    assert checked.status_code == 200
    assert checked.get_json()["correct"] is True
    assert checked.get_json()["hint_balance"] == 1
    again = client.post(
        f"/api/puzzles/{attempt_id}/check",
        headers=headers,
        json={"answer": solution},
    )
    assert again.get_json()["hint_balance"] == 1


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


def test_numbers_hint_fills_one_blank(client, student, app):
    opened = _open(client, student["token"], "numbers")
    assert opened.status_code == 201
    body = opened.get_json()
    attempt_id = body["id"]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    hint = revealed.get_json()["hint"]
    assert hint["kind"] == "fill"
    assert body["puzzle"]["givens"][hint["row"]][hint["col"]] == 0
    with app.app_context():
        solution = json.loads(db.session.get(PuzzleAttempt, attempt_id).proof_json)["solution"]
    assert solution[hint["row"]][hint["col"]] == hint["value"]


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

    public = {"rows": 8, "cols": 8, "blacks": ["1-1"]}
    solution = {"edges": ["0-0|0-1"]}
    hint = pick_hint("patika", public, {"solution": solution})
    assert hint == {"kind": "edge", "a": "0-0", "b": "0-1"}


def test_abc_hint_draws_the_first_letter():
    from app.services.cell_hint import pick_hint

    public = {"fixedCells": {"0-0": "A", "0-3": "A", "2-0": "B", "2-3": "B"}}
    solution = {"cells": ["0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "2-2", "2-3"]}
    hint = pick_hint("abc-baglama", public, {"solution": solution})
    assert hint == {"kind": "marks", "cells": ["0-1", "0-2"], "label": "A"}


def test_colour_hint_places_one_piece(client, student, app):
    opened = _open(client, student["token"], "colours")
    assert opened.status_code == 201
    attempt_id = opened.get_json()["id"]
    headers = {"Authorization": f"Bearer {student['token']}"}
    revealed = client.post(f"/api/puzzles/{attempt_id}/cell", headers=headers)
    assert revealed.status_code == 200, revealed.get_json()
    hint = revealed.get_json()["hint"]
    assert hint["kind"] == "form"
    with app.app_context():
        solution = json.loads(db.session.get(PuzzleAttempt, attempt_id).proof_json)["solution"]
    piece = solution[hint["row"]][hint["col"]]
    assert piece["shape"] == hint["shape"]
    assert piece["color"] == hint["color"]


def test_kakuro_hint_points_at_an_inner_cell():
    from app.services.cell_hint import pick_hint

    public = {"givens": [[0, 1], [2, 0]]}
    solution = [[None, None, None], [None, 4, 1], [None, 2, 3]]
    hint = pick_hint("kakuro", public, {"solution": solution})
    assert public["givens"][hint["row"]][hint["col"]] == 0
    inner = [row[1:] for row in solution[1:]]
    assert inner[hint["row"]][hint["col"]] == hint["value"]


def test_metaforms_hint_places_one_piece():
    from app.services.cell_hint import pick_hint

    grid = [
        [{"shape": "circle", "color": "red"}, {"shape": "square", "color": "yellow"}, {"shape": "triangle", "color": "blue"}],
        [{"shape": "square", "color": "blue"}, {"shape": "triangle", "color": "red"}, {"shape": "circle", "color": "yellow"}],
        [{"shape": "triangle", "color": "yellow"}, {"shape": "circle", "color": "blue"}, {"shape": "square", "color": "red"}],
    ]
    public = {"clues": [{"sign": "yes", "shape": "circle", "color": "red", "cells": ["0-0"]}]}
    hint = pick_hint("metaforms", public, {"solution": {"grid": grid}})
    assert hint["kind"] == "form"
    assert (hint["row"], hint["col"]) != (0, 0)
    piece = grid[hint["row"]][hint["col"]]
    assert hint["shape"] == piece["shape"]
    assert hint["color"] == piece["color"]


def test_pyramid_hint_marks_one_circle_on_the_path():
    from app.services.cell_hint import pick_hint

    path = [0, 0, 1, 1]
    hint = pick_hint("sihirli-piramit", {"rows": [[1], [2, 1], [2, 4, 3], [4, 3, 1, 2]]}, {"solution": {"path": path}})
    assert hint["kind"] == "mark"
    assert hint["note"] == "path"
    assert hint["row"] >= 1
    assert hint["col"] == path[hint["row"]]


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
