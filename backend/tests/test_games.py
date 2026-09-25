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


def test_display_names_use_the_book_titles(client):
    stars = client.get("/api/games/yildiz-savaslari").get_json()
    assert stars["name_tr"] == "Yıldız Savaşları"
    assert stars["name_en"] == "Star Battle"
    assert stars["slug"] == "yildiz-savaslari"
    fleet = client.get("/api/games/amiral-batti").get_json()
    assert fleet["name_tr"] == "Amiral Battı"
    assert fleet["name_en"] == "Battleships"
    cages = client.get("/api/games/kendoku").get_json()
    assert cages["name_tr"] == "Kendoku"
    logic = client.get("/api/games/metaforms").get_json()
    assert logic["name_tr"] == "Metaforms"
    assert logic["slug"] == "metaforms"


def test_get_unknown_game_returns_404(client):
    resp = client.get("/api/games/does-not-exist")
    assert resp.status_code == 404
