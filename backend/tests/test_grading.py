from app.models.game import GAME_CATALOG
from app.services.grading import GradeError, grade
from tests.helpers import auth_headers
from tests.payloads import post_score, reference


def test_every_catalog_round_grades():
    for index, entry in enumerate(GAME_CATALOG, start=1):
        puzzle, answer = reference(index)
        points, duration = grade(entry["slug"], "easy", puzzle, answer, 40)
        assert duration == 40
        assert points >= 100


def test_tampered_answer_is_rejected(client, student, app):
    auth = auth_headers(student["token"])
    _puzzle, answer = reference(2)
    answer[0][0] = answer[0][1]
    resp = post_score(client, auth, 2, app, duration=40, answer=answer)
    assert resp.status_code == 400


def test_metaforms_rejects_a_swapped_piece():
    assert GAME_CATALOG[16]["slug"] == "metaforms"
    puzzle, answer = reference(17)
    grid = answer["grid"]
    grid[0][0], grid[0][1] = grid[0][1], grid[0][0]
    try:
        grade("metaforms", "easy", puzzle, answer, 10)
    except GradeError:
        return
    raise AssertionError("yerleri değişen parçalar kabul edildi")


def test_grade_rejects_empty_sudoku():
    try:
        grade("sudoku", "easy", {"givens": [[0] * 9 for _ in range(9)]}, [[1] * 9 for _ in range(9)], 10)
    except GradeError:
        return
    raise AssertionError("boş sudoku kabul edildi")
