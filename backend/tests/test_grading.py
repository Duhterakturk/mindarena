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


def test_abc_accepts_a_cover_and_rejects_a_gap_or_swap():
    from copy import deepcopy

    assert GAME_CATALOG[8]["slug"] == "abc-baglama"
    puzzle, answer = reference(9)
    grade("abc-baglama", "easy", puzzle, answer, 12)

    gapped = deepcopy(answer)
    letter = next(iter(gapped["paths"]))
    gapped["paths"][letter] = gapped["paths"][letter][:-1]
    try:
        grade("abc-baglama", "easy", puzzle, gapped, 12)
    except GradeError:
        pass
    else:
        raise AssertionError("boş kare kabul edildi")

    keys = list(answer["paths"])
    swapped = deepcopy(answer)
    swapped["paths"][keys[0]], swapped["paths"][keys[1]] = swapped["paths"][keys[1]], swapped["paths"][keys[0]]
    try:
        grade("abc-baglama", "easy", puzzle, swapped, 12)
    except GradeError:
        return
    raise AssertionError("yer değiştiren yollar kabul edildi")


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


def test_numbers_book_layouts_pass_and_a_swap_fails():
    questions = [
        (
            [
                {"kind": "equation", "left": "A/I", "right": "H/D"},
                {"kind": "equation", "left": "D", "right": "B/F"},
                {"kind": "relation", "op": "+", "cells": ["C", "D", "G"]},
                {"kind": "total", "cells": ["A", "C"], "target": 16},
            ],
            [[9, 8, 7], [2, 1, 4], [5, 6, 3]],
        ),
        (
            [
                {"kind": "relation", "op": "*", "cells": ["B", "D", "F"]},
                {"kind": "equation", "left": "E", "right": "G+B"},
                {"kind": "total", "cells": ["A", "D", "G"], "target": 6},
                {"kind": "equation", "left": "H", "right": "C-A"},
                {"kind": "total", "cells": ["C", "F", "I"], "target": 24},
            ],
            [[3, 4, 9], [2, 5, 8], [1, 6, 7]],
        ),
        (
            [
                {"kind": "relation", "op": "+", "cells": ["E", "F", "I"]},
                {"kind": "relation", "op": "+", "cells": ["A", "C", "E"]},
                {"kind": "total", "cells": ["A", "D", "G"], "target": 7},
                {"kind": "equation", "left": "G", "right": "D-F"},
                {"kind": "total", "cells": ["B", "E", "H"], "target": 24},
                {"kind": "relation", "op": "+", "cells": ["D", "F", "H"]},
            ],
            [[2, 9, 6], [4, 8, 3], [1, 7, 5]],
        ),
    ]
    for clues, grid in questions:
        grade("numbers", "easy", {"clues": clues}, grid, 10)
        swapped = [row[:] for row in grid]
        swapped[0][0], swapped[0][1] = swapped[0][1], swapped[0][0]
        try:
            grade("numbers", "easy", {"clues": clues}, swapped, 10)
        except GradeError:
            continue
        raise AssertionError("yerleri değişen sayılar kabul edildi")


def test_pyramid_rejects_a_repeated_digit():
    assert GAME_CATALOG[6]["slug"] == "sihirli-piramit"
    puzzle, answer = reference(7)
    answer["path"] = [0, 1, 1, 1]
    try:
        grade("sihirli-piramit", "easy", puzzle, answer, 10)
    except GradeError:
        return
    raise AssertionError("tekrarlayan sayılı yol kabul edildi")


def test_grade_rejects_empty_sudoku():
    try:
        grade("sudoku", "easy", {"givens": [[0] * 9 for _ in range(9)]}, [[1] * 9 for _ in range(9)], 10)
    except GradeError:
        return
    raise AssertionError("boş sudoku kabul edildi")
