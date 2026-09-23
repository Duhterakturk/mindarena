MIN_REMINDER_LENGTH = 3

_FOLDS = str.maketrans({
    "İ": "i",
    "I": "i",
    "ı": "i",
    "Ş": "s",
    "ş": "s",
    "Ğ": "g",
    "ğ": "g",
    "Ü": "u",
    "ü": "u",
    "Ö": "o",
    "ö": "o",
    "Ç": "c",
    "ç": "c",
})


def normalize_reminder(value: str) -> str:
    text = " ".join((value or "").strip().split())
    return text.translate(_FOLDS).lower()
