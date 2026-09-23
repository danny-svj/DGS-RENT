#!/usr/bin/env python3
"""Generates clean, flat-style, isolated 3/4-glossy side-profile car
illustrations on a transparent background (studio product-shot style),
used as vehicle imagery across the DGS Rent a Car fleet grids.

v3: category SHAPES (sedan, suv, deportivo, van, pickup) are defined once,
independent of color; MODELS lists many color variants per shape so the
fleet can grow to dozens of visually distinct vehicles without hand-coding
a new silhouette for every unit. Glossier multi-stop paint gradient, a
brighter specular sheen, chrome-look trim and refined alloy wheels push the
illustrations closer to real studio photography while staying original
artwork (no traced/copied photographs).
"""
import re

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
  <defs>
    <linearGradient id="body-{id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{body_hilight}"/>
      <stop offset="28%" stop-color="{body_light}"/>
      <stop offset="70%" stop-color="{body_mid}"/>
      <stop offset="100%" stop-color="{body_dark}"/>
    </linearGradient>
    <linearGradient id="glass-{id}" x1="0" y1="0" x2="0.15" y2="1">
      <stop offset="0%" stop-color="#eaf1ff"/>
      <stop offset="45%" stop-color="#b7c9ea"/>
      <stop offset="100%" stop-color="#71829e"/>
    </linearGradient>
    <linearGradient id="sheen-{id}" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.78"/>
      <stop offset="22%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="shadow-{id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10162b" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#10162b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="arch-{id}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#05070f" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#05070f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rim-{id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2f4fb"/>
      <stop offset="55%" stop-color="#aab4d4"/>
      <stop offset="100%" stop-color="#6b7395"/>
    </linearGradient>
  </defs>

  <ellipse cx="400" cy="362" rx="305" ry="24" fill="url(#shadow-{id})"/>

  <ellipse cx="{w1}" cy="316" rx="72" ry="30" fill="url(#arch-{id})"/>
  <ellipse cx="{w2}" cy="316" rx="72" ry="30" fill="url(#arch-{id})"/>

  {body_path}

  {sheen_path}

  {roof_path}

  {window_path}

  <!-- door seam + handle -->
  {door_line}

  <!-- lights -->
  <rect x="{tail_x}" y="{light_y}" width="14" height="20" rx="4" fill="#e42b3c"/>
  <rect x="{tail_x}" y="{light_y}" width="14" height="20" rx="4" fill="none" stroke="#8c0f1c" stroke-width="1.5"/>
  <rect x="{head_x}" y="{light_y}" width="16" height="18" rx="4" fill="#fff3c4"/>
  <rect x="{head_x}" y="{light_y}" width="16" height="18" rx="4" fill="none" stroke="#d1a83a" stroke-width="1.5"/>

  <!-- side accent stripe -->
  <path d="{stripe_path}" fill="{accent}" opacity="0.9"/>

  <!-- wheels -->
  {wheel1}
  {wheel2}
</svg>
"""


def spokes(cx, cy=330, n=5, r_in=13, r_out=29):
    parts = []
    for i in range(n):
        angle = i * (360 / n)
        parts.append(
            f'<rect x="{cx - 4.5}" y="{cy - r_out}" width="9" height="{r_out - r_in}" '
            f'rx="4" fill="#4c5578" transform="rotate({angle:.1f} {cx} {cy})"/>'
        )
    return "".join(parts)


def wheel_svg(cx, cy=330):
    return f'''<g>
    <circle cx="{cx}" cy="{cy}" r="53" fill="#12162a"/>
    <circle cx="{cx}" cy="{cy}" r="53" fill="none" stroke="#000000" stroke-width="2" opacity="0.4"/>
    <circle cx="{cx}" cy="{cy}" r="34" fill="#232840"/>
    <circle cx="{cx}" cy="{cy}" r="30" fill="url(#rim-shared)"/>
    {spokes(cx, cy)}
    <circle cx="{cx}" cy="{cy}" r="12" fill="#eef1fa"/>
    <circle cx="{cx}" cy="{cy}" r="12" fill="none" stroke="#8f99bd" stroke-width="1.5"/>
    <circle cx="{cx - 16}" cy="{cy - 18}" r="9" fill="#ffffff" opacity="0.35"/>
  </g>'''


RIM_GRADIENT = '''    <linearGradient id="rim-shared" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2f4fb"/>
      <stop offset="55%" stop-color="#aab4d4"/>
      <stop offset="100%" stop-color="#6b7395"/>
    </linearGradient>
'''

# ---------------------------------------------------------------------------
# Category silhouettes (color-independent). Each shape defines the body
# outline, glass, roof/door details and reference x positions for lights and
# wheels. Colors are layered on top per model in MODELS below.
# ---------------------------------------------------------------------------
SHAPES = {
    "sedan": dict(
        body_d="M120 300 C120 260 150 235 200 225 L260 165 C280 150 305 142 335 142 L470 142 C500 142 525 150 545 168 L600 225 C650 232 685 250 695 285 L695 300 C695 312 686 320 674 320 L146 320 C133 320 120 312 120 300 Z",
        window_d="M282 214 L308 176 C316 164 330 157 344 157 L450 157 C465 157 478 165 486 178 L510 214 Z",
        window_seam="M398 157 L398 214",
        door_line_tpl='<line x1="398" y1="222" x2="398" y2="308" stroke="{dark}" stroke-width="3" opacity="0.5"/><rect x="418" y="248" width="30" height="6" rx="3" fill="{darker}"/>',
        stripe_path="M120 296 L695 296 L695 306 L120 306 Z",
        tail_x=140, head_x=666, light_y=280, w1=228, w2=580,
    ),
    "suv": dict(
        body_d="M105 300 C105 255 135 228 190 220 L225 155 C238 135 262 122 288 122 L520 122 C548 122 573 135 588 158 L618 220 C662 226 700 246 700 285 L700 300 C700 312 691 320 679 320 L131 320 C118 320 105 312 105 300 Z",
        window_d="M250 216 L272 168 C280 150 298 138 318 138 L490 138 C508 138 524 149 532 166 L556 216 Z",
        window_seam="M402 138 L402 216",
        window_extra='<line x1="330" y1="150" x2="330" y2="216" stroke="{dark}" stroke-width="3" opacity="0.6"/>',
        door_line_tpl='<line x1="402" y1="224" x2="402" y2="308" stroke="{dark}" stroke-width="3" opacity="0.5"/><rect x="422" y="248" width="30" height="6" rx="3" fill="{darker}"/><path d="M225 158 L618 158" stroke="{roofrail}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>',
        stripe_path="M105 296 L700 296 L700 308 L105 308 Z",
        tail_x=125, head_x=670, light_y=278, w1=215, w2=595,
    ),
    "deportivo": dict(
        body_d="M90 305 C90 275 108 255 145 245 L205 200 L245 155 C262 138 288 128 315 128 L470 128 C495 128 515 140 528 160 L565 210 L640 240 C672 250 705 262 705 292 L705 305 C705 314 697 320 688 320 L107 320 C98 320 90 314 90 305 Z",
        window_d="M266 196 L296 162 C304 152 316 146 328 146 L434 146 C446 146 456 152 464 163 L490 196 C440 190 380 187 378 187 C340 187 296 190 266 196 Z",
        window_seam="",
        door_line_tpl='<path d="M420 200 C440 240 440 275 425 312" stroke="{dark}" stroke-width="3" opacity="0.5" fill="none"/><path d="M560 175 L610 218" stroke="{darker}" stroke-width="10" stroke-linecap="round"/>',
        stripe_path="M90 298 L705 298 L705 308 L90 308 Z M300 132 L470 132 L470 140 L300 140 Z",
        tail_x=108, head_x=676, light_y=282, w1=210, w2=590,
    ),
    "van": dict(
        body_d="M95 300 C95 240 100 175 118 145 C126 130 142 120 160 120 L630 120 C658 120 682 140 690 168 L700 230 C712 236 715 255 715 285 L715 300 C715 312 706 320 694 320 L121 320 C108 320 95 312 95 300 Z",
        window_d="M148 210 L162 152 C167 136 180 126 196 126 L370 126 L370 210 Z",
        window_d2="M382 126 L560 126 C578 126 594 138 599 156 L612 210 L382 210 Z",
        window_seam="M376 126 L376 210",
        window_extra='<line x1="470" y1="126" x2="470" y2="210" stroke="{dark}" stroke-width="3" opacity="0.7"/>',
        door_line_tpl='<line x1="376" y1="218" x2="376" y2="308" stroke="{lighter}" stroke-width="3"/><line x1="612" y1="218" x2="612" y2="308" stroke="{lighter}" stroke-width="3"/><rect x="392" y="250" width="34" height="6" rx="3" fill="{darker}"/><rect x="628" y="250" width="30" height="6" rx="3" fill="{darker}"/>',
        stripe_path="M95 292 L715 292 L715 304 L95 304 Z",
        tail_x=112, head_x=686, light_y=278, w1=225, w2=615,
    ),
    "pickup": dict(
        # Bed (rear, left) + short crew cab (front, right) — a genuinely
        # different silhouette from the SUV/van so pickups read at a glance.
        body_d="M95 300 L95 258 C95 250 101 245 110 245 L420 245 C430 245 434 240 440 233 L458 200 C466 176 480 158 500 145 C516 135 535 130 555 130 L648 130 C663 130 676 138 683 151 L700 190 C709 195 712 210 712 232 L712 300 C712 312 703 320 691 320 L111 320 C98 320 95 312 95 300 Z",
        window_d="M470 202 L486 168 C494 151 511 141 529 141 L616 141 C630 141 642 149 648 161 L664 202 Z",
        window_seam="M556 141 L556 202",
        door_line_tpl='<line x1="112" y1="247" x2="418" y2="247" stroke="{lighter}" stroke-width="3" opacity="0.9"/><line x1="420" y1="256" x2="684" y2="256" stroke="{darker}" stroke-width="3" opacity="0.55"/><line x1="556" y1="210" x2="556" y2="312" stroke="{dark}" stroke-width="3" opacity="0.5"/><rect x="576" y="252" width="28" height="6" rx="3" fill="{darker}"/><path d="M112 247 L112 320" stroke="{darker}" stroke-width="4" opacity="0.65"/><path d="M182 300 C182 272 206 258 232 258 C258 258 282 272 282 300" stroke="{darker}" stroke-width="3" fill="none" opacity="0.55"/>',
        stripe_path="M95 296 L712 296 L712 306 L95 306 Z",
        tail_x=112, head_x=684, light_y=280, w1=225, w2=605,
    ),
}

# ---------------------------------------------------------------------------
# Color palette. (light, dark, accent) — a soft highlight and mid tone are
# derived automatically so every entry only needs two or three base colors.
# ---------------------------------------------------------------------------
def shade(hex_color, factor):
    """Lighten (factor>0) or darken (factor<0) a #rrggbb color."""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    if factor >= 0:
        r = int(r + (255 - r) * factor)
        g = int(g + (255 - g) * factor)
        b = int(b + (255 - b) * factor)
    else:
        r = int(r * (1 + factor))
        g = int(g * (1 + factor))
        b = int(b * (1 + factor))
    return f"#{max(0,min(255,r)):02x}{max(0,min(255,g)):02x}{max(0,min(255,b)):02x}"


COLORS = {
    "blue": ("#4468f2", "#10237e"),
    "red": ("#f96674", "#7a0f1c"),
    "white": ("#fbfcff", "#c3c9de"),
    "gold": ("#f4c15b", "#8a5a10"),
    "silver": ("#dbe0f0", "#5a648c"),
    "black": ("#4a5378", "#0d0f1a"),
    "graphite": ("#6b7590", "#262b40"),
    "green": ("#5fbf8f", "#155c3e"),
    "yellow": ("#ffd84d", "#a86c06"),
}

# name -> (shape, color-key)
MODELS = {
    "sedan-blue": ("sedan", "blue"),
    "sedan-red": ("sedan", "red"),
    "sedan-white": ("sedan", "white"),
    "sedan-gold": ("sedan", "gold"),
    "sedan-silver": ("sedan", "silver"),
    "sedan-black": ("sedan", "black"),
    "sedan-graphite": ("sedan", "graphite"),
    "suv-silver": ("suv", "silver"),
    "suv-dark": ("suv", "black"),
    "suv-red": ("suv", "red"),
    "suv-white": ("suv", "white"),
    "suv-blue": ("suv", "blue"),
    "suv-green": ("suv", "green"),
    "deportivo-red": ("deportivo", "red"),
    "deportivo-yellow": ("deportivo", "yellow"),
    "deportivo-black": ("deportivo", "black"),
    "deportivo-blue": ("deportivo", "blue"),
    "van-white": ("van", "white"),
    "van-silver": ("van", "silver"),
    "van-blue": ("van", "blue"),
    "pickup-gray": ("pickup", "graphite"),
    "pickup-white": ("pickup", "white"),
    "pickup-black": ("pickup", "black"),
    "pickup-red": ("pickup", "red"),
}

if __name__ == "__main__":
    for name, (shape_key, color_key) in MODELS.items():
        shape = SHAPES[shape_key]
        light, dark = COLORS[color_key]
        uid = re.sub(r'[^a-z0-9]', '', name)[:8]
        hilight = shade(light, 0.45)
        mid = shade(light, -0.12)
        darker = shade(dark, -0.35)
        lighter = shade(light, 0.2)
        roofrail = shade(dark, 0.15)

        body_path = f'<path d="{shape["body_d"]}" fill="url(#body-{uid})" stroke="{dark}" stroke-width="3.5" stroke-linejoin="round"/>'

        window_extra = shape.get("window_extra", "").format(dark=dark) if shape.get("window_extra") else ""
        window_d2 = shape.get("window_d2")
        window_path = (
            f'<path d="{shape["window_d"]}" fill="url(#glass-{uid})" stroke="{dark}" stroke-width="3" stroke-linejoin="round"/>'
        )
        if window_d2:
            window_path += f'<path d="{window_d2}" fill="url(#glass-{uid})" stroke="{dark}" stroke-width="2.5" stroke-linejoin="round"/>'
        if shape.get("window_seam"):
            window_path += f'<path d="{shape["window_seam"]}" stroke="{dark}" stroke-width="4" fill="none"/>'
        window_path += window_extra

        door_line = shape["door_line_tpl"].format(dark=dark, darker=darker, lighter=lighter, roofrail=roofrail)

        p = dict(
            id=uid,
            body_hilight=hilight, body_light=light, body_mid=mid, body_dark=dark,
            accent=darker,
            body_path=body_path,
            roof_path="",
            window_path=window_path,
            door_line=door_line,
            stripe_path=shape["stripe_path"],
            tail_x=shape["tail_x"], head_x=shape["head_x"], light_y=shape["light_y"],
            w1=shape["w1"], w2=shape["w2"],
        )

        d_match = re.search(r'd="([^"]+)"', body_path)
        p["sheen_path"] = (
            f'<path d="{d_match.group(1)}" fill="url(#sheen-{uid})"/>' if d_match else ""
        )
        p["wheel1"] = wheel_svg(p["w1"])
        p["wheel2"] = wheel_svg(p["w2"])
        svg = TEMPLATE.format(**p)
        svg = svg.replace("<defs>\n", "<defs>\n" + RIM_GRADIENT, 1)
        with open(f"{name}.svg", "w") as f:
            f.write(svg)
        print("wrote", name + ".svg")
