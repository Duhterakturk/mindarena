import random


class HintError(Exception):
    pass


_FILL = {
    "sudoku",
    "kakuro",
    "bolgesel-sudoku",
    "apartman",
    "islem-karesi",
    "kendoku",
    "carpmaca",
    "futoshiki",
    "sihirli-piramit",
}
_MARK = {
    "amiral-batti",
    "patika",
    "abc-baglama",
    "yildiz-savaslari",
    "kare-karalamaca",
    "pentominolar",
}


def pick_hint(slug, public, proof):
    public = public or {}
    proof = proof or {}
    solution = proof.get("solution")
    if slug in _FILL:
        return _fill(public, solution)
    if slug == "cit":
        return _edge(solution)
    if slug in _MARK:
        return _mark(public, solution)
    if slug == "numbers":
        return _spot(public)
    if slug == "colours":
        return _colour(public, solution)
    if slug == "metaforms":
        return _odd_shape(solution)
    raise HintError("Bu bulmacada açılacak kare yok")


def _fill(public, solution):
    if not isinstance(solution, list):
        raise HintError("Bu bulmaca kare açmaya hazır değil. Yeni bir tane aç.")
    blanks = []
    for row_index, row in enumerate(solution):
        if not isinstance(row, list):
            continue
        for col_index, value in enumerate(row):
            if value in (0, None, ""):
                continue
            if _blank(public, row_index, col_index):
                blanks.append((row_index, col_index, value))
    if not blanks:
        raise HintError("Açılacak boş kare kalmadı")
    row_index, col_index, value = random.choice(blanks)
    return {"kind": "fill", "row": row_index, "col": col_index, "value": value}


def _blank(public, row_index, col_index):
    givens = public.get("givens")
    if givens is None and _jagged(public.get("rows")):
        givens = public["rows"]
    if givens is None:
        return True
    try:
        value = givens[row_index][col_index]
    except (IndexError, TypeError, KeyError):
        return True
    return value in (0, None, "")


def _jagged(rows):
    return isinstance(rows, list) and rows and isinstance(rows[0], list)


def _edge(solution):
    if not isinstance(solution, dict):
        raise HintError("Bu bulmaca kare açmaya hazır değil. Yeni bir tane aç.")
    spots = []
    for axis, key in (("horizontal", "h"), ("vertical", "v")):
        grid = solution.get(axis) or []
        for row_index, row in enumerate(grid):
            for col_index, flag in enumerate(row):
                if flag:
                    spots.append((key, row_index, col_index))
    if not spots:
        raise HintError("Açılacak çizgi kalmadı")
    axis, row_index, col_index = random.choice(spots)
    return {"kind": "edge", "axis": axis, "row": row_index, "col": col_index}


def _mark(public, solution):
    cells = _cells(solution)
    if not cells:
        raise HintError("Bu bulmaca kare açmaya hazır değil. Yeni bir tane aç.")
    fixed = set((public.get("fixedCells") or {}).keys())
    spots = []
    for key in cells:
        if key in fixed:
            continue
        parts = str(key).split("-")
        if len(parts) != 2 or not parts[0].isdigit() or not parts[1].isdigit():
            continue
        spots.append((int(parts[0]), int(parts[1])))
    if not spots:
        raise HintError("Açılacak boş kare kalmadı")
    row_index, col_index = random.choice(spots)
    return {"kind": "mark", "row": row_index, "col": col_index}


def _cells(solution):
    if not isinstance(solution, dict):
        return []
    if solution.get("cells"):
        return list(solution["cells"])
    cells = []
    for piece in solution.get("placements") or []:
        cells.extend(piece.get("cells") or [])
    return cells


def _spot(public):
    values = public.get("values") or []
    try:
        index = list(values).index(1)
    except ValueError as exc:
        raise HintError("Açılacak kare kalmadı") from exc
    return {"kind": "spot", "index": index, "value": 1}


def _colour(public, solution):
    choices = solution.get("choices") if isinstance(solution, dict) else None
    if choices:
        return {"kind": "choice", "round": 0, "value": choices[0]}
    rounds = public.get("rounds") or []
    if not rounds or "inkId" not in rounds[0]:
        raise HintError("Bu bulmaca kare açmaya hazır değil. Yeni bir tane aç.")
    return {"kind": "choice", "round": 0, "value": rounds[0]["inkId"]}


def _odd_shape(solution):
    choices = solution.get("choices") if isinstance(solution, dict) else None
    if not choices:
        raise HintError("Bu bulmaca kare açmaya hazır değil. Yeni bir tane aç.")
    return {"kind": "choice", "round": 0, "index": choices[0]}
