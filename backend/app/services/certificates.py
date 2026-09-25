"""Sertifika eşikleri. Öğretmen bir şey yapmaz; skor yazılınca kendiliğinden oluşur."""

import os
import secrets
from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.extensions import db
from app.models import GAME_CATALOG, Certificate, Classroom, Game, Score, User, UserRole
from app.services.character import stage_for

PUZZLE_GOALS = (10, 50, 100, 250, 500)
MASTER_NEED = 50
DAY_GOAL = 7

_FONT = "CertBody"
_FONT_READY = False


def kinds():
    rows = [f"puzzles-{goal}" for goal in PUZZLE_GOALS]
    rows.append("master")
    rows.append("all-games")
    rows.append("days-7")
    return rows


def _metrics(user_id):
    games = {game.id: game.slug for game in Game.query.all()}
    scores = Score.query.filter_by(user_id=user_id, completed=True).all()
    by_slug = {entry["slug"]: 0 for entry in GAME_CATALOG}
    days = set()
    for score in scores:
        slug = games.get(score.game_id)
        if slug in by_slug:
            by_slug[slug] += 1
        if score.created_at:
            days.add(score.created_at.date())
    return {
        "total": len(scores),
        "by_slug": by_slug,
        "best_game": max(by_slug.values()) if by_slug else 0,
        "games_done": sum(1 for count in by_slug.values() if count >= 1),
        "game_total": len(GAME_CATALOG),
        "days": len(days),
    }


def _met(kind, metrics):
    if kind.startswith("puzzles-"):
        return metrics["total"] >= int(kind.split("-", 1)[1])
    if kind == "master":
        return metrics["best_game"] >= MASTER_NEED
    if kind == "all-games":
        return metrics["games_done"] >= metrics["game_total"] and metrics["game_total"] > 0
    if kind == "days-7":
        return metrics["days"] >= DAY_GOAL
    return False


def progress_of(kind, metrics):
    if kind.startswith("puzzles-"):
        need = int(kind.split("-", 1)[1])
        current = metrics["total"]
    elif kind == "master":
        need = MASTER_NEED
        current = metrics["best_game"]
    elif kind == "all-games":
        need = metrics["game_total"]
        current = metrics["games_done"]
    else:
        need = DAY_GOAL
        current = metrics["days"]
    return {"current": current, "need": need, "remaining": max(0, need - current)}


def award_new(user_id):
    metrics = _metrics(user_id)
    owned = {row.kind for row in Certificate.query.filter_by(user_id=user_id).all()}
    created = []
    for kind in kinds():
        if kind in owned or not _met(kind, metrics):
            continue
        row = Certificate(
            user_id=user_id,
            kind=kind,
            earned_at=datetime.utcnow(),
            verify_code=secrets.token_hex(4),
        )
        db.session.add(row)
        created.append(row)
    if created:
        db.session.flush()
    return created


def catalog_for(user_id):
    metrics = _metrics(user_id)
    owned = {row.kind: row for row in Certificate.query.filter_by(user_id=user_id).all()}
    rows = []
    for kind in kinds():
        row = owned.get(kind)
        payload = {"kind": kind, "earned": row is not None, "progress": progress_of(kind, metrics)}
        if row:
            payload.update(row.to_dict())
        rows.append(payload)
    return rows


def can_read(viewer, owner_id):
    if viewer is None:
        return False
    if viewer.id == owner_id:
        return True
    if viewer.role != UserRole.TEACHER:
        return False
    student = db.session.get(User, owner_id)
    if student is None or student.classroom_id is None:
        return False
    classroom = db.session.get(Classroom, student.classroom_id)
    return classroom is not None and classroom.teacher_id == viewer.id


def font_path():
    here = os.path.join(os.path.dirname(__file__), "..", "..", "fonts", "DejaVuSans.ttf")
    candidates = [
        os.path.abspath(here),
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    return None


def _ensure_font():
    global _FONT_READY
    if _FONT_READY:
        return
    path = font_path()
    if not path:
        raise RuntimeError("Türkçe yazı tipi yok")
    pdfmetrics.registerFont(TTFont(_FONT, path))
    _FONT_READY = True


def _draw_owl(pen, stage, x, y):
    if stage == "egg":
        pen.setFillColorRGB(0.96, 0.91, 0.76)
        pen.ellipse(x, y, x + 70, y + 86, stroke=1, fill=1)
        return
    pen.setFillColorRGB(0.79, 0.52, 0.23)
    pen.circle(x + 22, y + 62, 16, stroke=0, fill=1)
    pen.circle(x + 52, y + 62, 16, stroke=0, fill=1)
    pen.ellipse(x + 4, y, x + 70, y + 58, stroke=0, fill=1)
    pen.setFillColorRGB(0.12, 0.1, 0.09)
    pen.circle(x + 22, y + 62, 5, stroke=0, fill=1)
    pen.circle(x + 52, y + 62, 5, stroke=0, fill=1)


def render_pdf(user, certificate):
    _ensure_font()
    metrics = _metrics(user.id)
    buffer = BytesIO()
    page = landscape(A4)
    pen = canvas.Canvas(buffer, pagesize=page)
    width, height = page
    pen.setFillColorRGB(1, 0.97, 0.9)
    pen.rect(0, 0, width, height, stroke=0, fill=1)
    pen.setStrokeColorRGB(0.85, 0.55, 0.2)
    pen.setLineWidth(8)
    pen.rect(28, 28, width - 56, height - 56, stroke=1, fill=0)
    pen.setFillColorRGB(0.2, 0.35, 0.75)
    pen.setFont(_FONT, 28)
    pen.drawCentredString(width / 2, height - 90, "MindArena")
    pen.setFillColorRGB(0.12, 0.1, 0.08)
    pen.setFont(_FONT, 36)
    pen.drawCentredString(width / 2, height - 170, user.full_name)
    pen.setFont(_FONT, 18)
    pen.drawCentredString(width / 2, height - 220, _line(certificate.kind, metrics))
    when = certificate.earned_at.strftime("%d.%m.%Y") if certificate.earned_at else ""
    pen.setFont(_FONT, 14)
    pen.drawCentredString(width / 2, height - 260, when)
    _draw_owl(pen, stage_for(metrics["total"]), 70, 70)
    pen.setFillColorRGB(0.35, 0.28, 0.2)
    pen.setFont(_FONT, 12)
    pen.drawCentredString(width / 2, 58, certificate.verify_code)
    pen.save()
    buffer.seek(0)
    return buffer


def _line(kind, metrics):
    if kind.startswith("puzzles-"):
        return f"{kind.split('-', 1)[1]} bulmaca çözdü"
    if kind == "master":
        return "Bir oyunda Usta oldu"
    if kind == "all-games":
        return f"{metrics['game_total']} oyunun hepsinden bulmaca çözdü"
    return "7 farklı günde oynadı"
