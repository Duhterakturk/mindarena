def test_list_games_returns_full_catalog(client):
    resp = client.get("/api/games")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 19
    slugs = {g["slug"] for g in data}
    assert "sudoku" in slugs
    assert "kakuro" in slugs


def test_get_game_by_slug(client):
    resp = client.get("/api/games/sudoku")
    assert resp.status_code == 200
    assert resp.get_json()["slug"] == "sudoku"


def test_get_unknown_game_returns_404(client):
    resp = client.get("/api/games/does-not-exist")
    assert resp.status_code == 404
