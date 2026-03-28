"""Ukloni svijetlu pozadinu i izreži PNG do maskote (jednokratno za public/smechat-logo.png)."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "smechat-logo.png"


def main() -> int:
    if not SRC.exists():
        print(f"Missing {SRC}", file=sys.stderr)
        return 1

    img = Image.open(SRC).convert("RGBA")
    a = np.array(img)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]

    mx = np.maximum(np.maximum(r.astype(np.float32), g), b)
    mn = np.minimum(np.minimum(r.astype(np.float32), g), mx)
    sat = np.zeros_like(mx, dtype=np.float32)
    np.divide(mx - mn, mx, out=sat, where=mx > 1e-3)
    luma = 0.299 * r + 0.587 * g + 0.114 * b

    # Svijetla, slabo zasićena = pozadina (bijela / siva magla)
    bg = (luma >= 246) & (sat < 0.12)
    # Jako bijelo
    bg |= (r > 250) & (g > 250) & (b > 250)

    a[:, :, 3] = np.where(bg, 0, a[:, :, 3])

    out = Image.fromarray(a)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    out.save(SRC, optimize=True)
    print(f"Saved trimmed transparent logo -> {SRC} ({out.size[0]}x{out.size[1]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
