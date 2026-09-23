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


def test_display_names_describe_the_puzzle_without_branded_titles(client):
    stars = client.get("/api/games/yildiz-savaslari").get_json()
    assert stars["name_tr"] == "Yıldız Yerleşimi"
    assert stars["name_en"] == "Star Places"
    fleet = client.get("/api/games/amiral-batti").get_json()
    assert fleet["name_tr"] == "Gizli Gemiler"
    cages = client.get("/api/games/kendoku").get_json()
    assert cages["name_tr"] == "İşlem Kafesi"
    logic = client.get("/api/games/metaforms").get_json()
    assert logic["name_tr"] == "Mini Mantık"
    assert "metaform" not in logic["name_tr"].lower()


def test_get_unknown_game_returns_404(client):
    resp = client.get("/api/games/does-not-exist")
    assert resp.status_code == 404
