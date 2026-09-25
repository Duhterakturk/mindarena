"""Baykuş aşaması ve oyun unvanı. İkisi de çözülen bulmaca sayısından gelir."""

STAGES = (
    ("egg", 0),
    ("chick", 10),
    ("young", 50),
    ("wise", 150),
    ("legend", 400),
)

STAGE_PHOTO = {
    "egg": "egg.webp",
    "chick": "owlet.webp",
    "young": "barn.webp",
    "wise": "snowy.webp",
    "legend": "eagle.webp",
}

RANKS = (
    ("apprentice", 5),
    ("journeyman", 20),
    ("master", 50),
    ("grandmaster", 100),
)


def stage_for(solved):
    name = STAGES[0][0]
    for stage, need in STAGES:
        if solved >= need:
            name = stage
    return name


def next_stage(solved):
    for stage, need in STAGES:
        if solved < need:
            return {"stage": stage, "remaining": need - solved}
    return None


def rank_for(solved):
    name = None
    for rank, need in RANKS:
        if solved >= need:
            name = rank
    return name


def crossed(before, after, table):
    """Eşik bir skorla geçildiyse yeni adın anahtarını döndürür."""
    gained = None
    for key, need in table:
        if before < need <= after:
            gained = key
    return gained
