#!/usr/bin/env python3
"""
Snap off-scale corner radii and off-grid spacing onto the theme scales.

Conservative by design: a value moves only when the nearest scale step is at
most 2px away, so no element changes shape in a way the eye would register as
a redesign; it just stops disagreeing with its neighbours. Ties round up.
1px spacing is a hairline and is left alone. Radii of 32 and above belong to
elements whose curve is set by their own size and are left alone, as is any
spacing of 32 or more that sits on the 4pt grid: page and hero insets.

  python3 scripts/snap-design-scale.py           # report
  python3 scripts/snap-design-scale.py --apply
  python3 scripts/snap-design-scale.py --check   # exit 1 if anything is off the scale (guard)
"""
import glob
import re
import sys
from collections import Counter

APPLY = '--apply' in sys.argv
CHECK = '--check' in sys.argv

RADII = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48]
SPACING = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48]
MAX_MOVE = 2

FILES = [
    f for pattern in ('app/**/*.js', 'components/**/*.js')
    for f in glob.glob(pattern, recursive=True)
]

RADIUS_RE = re.compile(r'(borderRadius|border(?:Top|Bottom)(?:Left|Right)Radius):\s*(\d+)\b')
SPACING_RE = re.compile(
    r'((?:padding|margin)(?:Top|Bottom|Left|Right|Horizontal|Vertical|Start|End)?|gap|rowGap|columnGap):\s*(\d+)\b'
)


def snap(value, scale, floor_keep=None):
    if value in scale:
        return value
    if floor_keep is not None and value >= floor_keep:
        return value
    best = min(scale, key=lambda s: (abs(s - value), -s))  # tie -> larger
    return best if abs(best - value) <= MAX_MOVE else value


def main():
    moves = Counter()
    stranded = []  # off the scale and more than MAX_MOVE away: needs a human
    changed_files = 0
    for path in FILES:
        src = open(path).read()
        out = src

        def fix_radius(m):
            v = int(m.group(2))
            if v == 999 or v == 9999:
                return m.group(0)
            n = snap(v, RADII, floor_keep=32)
            if n != v:
                moves[f'radius {v}->{n}'] += 1
            elif v not in RADII and v < 32:
                stranded.append(f'{path}: {m.group(0)}')
            return f'{m.group(1)}: {n}'

        def fix_spacing(m):
            v = int(m.group(2))
            if v == 1:
                return m.group(0)
            if v >= 32 and v % 4 == 0:
                return m.group(0)
            n = snap(v, SPACING)
            if n != v:
                moves[f'spacing {v}->{n}'] += 1
            elif v not in SPACING:
                stranded.append(f'{path}: {m.group(0)}')
            return f'{m.group(1)}: {n}'

        out = RADIUS_RE.sub(fix_radius, out)
        out = SPACING_RE.sub(fix_spacing, out)
        if out != src:
            changed_files += 1
            if APPLY:
                open(path, 'w').write(out)

    for k, n in sorted(moves.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f'{n:>4}  {k}')
    print(f'\n{sum(moves.values())} values in {changed_files} files {"updated" if APPLY else "would change"}')
    if stranded:
        print(f'\n{len(stranded)} off the scale by more than {MAX_MOVE}px, pick a scale value by hand:')
        for line in stranded:
            print('  ' + line)
    if CHECK:
        ok = not moves and not stranded
        print('design scale ok' if ok else '\nRun `python3 scripts/snap-design-scale.py --apply` for the snappable ones.')
        sys.exit(0 if ok else 1)
    if not APPLY:
        print('dry run. Re-run with --apply')


if __name__ == '__main__':
    main()
