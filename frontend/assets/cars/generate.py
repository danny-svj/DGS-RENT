#!/usr/bin/env python3
"""Generates clean, flat-style, isolated side-profile car illustrations on a
white background (product-shot style, like Uber/Turo category icons), used
as vehicle imagery across the DGS Rent a Car fleet grids."""

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
  <defs>
    <linearGradient id="body-{id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{body_light}"/>
      <stop offset="100%" stop-color="{body_dark}"/>
    </linearGradient>
    <linearGradient id="glass-{id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bcd0f7"/>
      <stop offset="100%" stop-color="#8ba6e0"/>
    </linearGradient>
    <radialGradient id="shadow-{id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10162b" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#10162b" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <ellipse cx="400" cy="360" rx="300" ry="26" fill="url(#shadow-{id})"/>

  {body_path}

  {roof_path}

  {window_path}

  <!-- door seam + handle -->
  {door_line}

  <!-- lights -->
  <rect x="{tail_x}" y="{light_y}" width="14" height="20" rx="4" fill="#e42b3c"/>
  <rect x="{head_x}" y="{light_y}" width="16" height="18" rx="4" fill="#fff3c4"/>

  <!-- side accent stripe -->
  <path d="{stripe_path}" fill="{accent}" opacity="0.85"/>

  <!-- wheels -->
  <g>
    <circle cx="{w1}" cy="330" r="52" fill="#1a1f2e"/>
    <circle cx="{w1}" cy="330" r="30" fill="#3a4160"/>
    <circle cx="{w1}" cy="330" r="11" fill="#c7cee0"/>
  </g>
  <g>
    <circle cx="{w2}" cy="330" r="52" fill="#1a1f2e"/>
    <circle cx="{w2}" cy="330" r="30" fill="#3a4160"/>
    <circle cx="{w2}" cy="330" r="11" fill="#c7cee0"/>
  </g>
</svg>
"""

CARS = {
    "sedan-blue": dict(
        id="sb", body_light="#3358e0", body_dark="#1a3fd6", accent="#10237e",
        body_path='<path d="M120 300 C120 260 150 235 200 225 L260 165 C280 150 305 142 335 142 L470 142 C500 142 525 150 545 168 L600 225 C650 232 685 250 695 285 L695 300 C695 312 686 320 674 320 L146 320 C133 320 120 312 120 300 Z" fill="url(#body-sb)"/>',
        roof_path='<path d="M270 218 L300 172 C312 156 330 148 350 148 L455 148 C475 148 493 157 505 173 L535 218 Z" fill="url(#body-sb)" opacity="0.001"/>',
        window_path='<path d="M282 214 L308 176 C316 164 330 157 344 157 L450 157 C465 157 478 165 486 178 L510 214 Z" fill="url(#glass-sb)"/><line x1="398" y1="157" x2="398" y2="214" stroke="#1a3fd6" stroke-width="4"/>',
        door_line='<line x1="398" y1="222" x2="398" y2="308" stroke="#10237e" stroke-width="3" opacity="0.5"/><rect x="418" y="248" width="30" height="6" rx="3" fill="#0c1a5c"/>',
        stripe_path="M120 296 L695 296 L695 306 L120 306 Z",
        tail_x=140, head_x=666, light_y=280, w1=228, w2=580,
    ),
    "sedan-red": dict(
        id="sr", body_light="#ef4a5a", body_dark="#c41f30", accent="#7a0f1c",
        body_path='<path d="M120 300 C120 260 150 235 200 225 L260 165 C280 150 305 142 335 142 L470 142 C500 142 525 150 545 168 L600 225 C650 232 685 250 695 285 L695 300 C695 312 686 320 674 320 L146 320 C133 320 120 312 120 300 Z" fill="url(#body-sr)"/>',
        roof_path="",
        window_path='<path d="M282 214 L308 176 C316 164 330 157 344 157 L450 157 C465 157 478 165 486 178 L510 214 Z" fill="url(#glass-sr)"/><line x1="398" y1="157" x2="398" y2="214" stroke="#c41f30" stroke-width="4"/>',
        door_line='<line x1="398" y1="222" x2="398" y2="308" stroke="#7a0f1c" stroke-width="3" opacity="0.5"/><rect x="418" y="248" width="30" height="6" rx="3" fill="#5a0a14"/>',
        stripe_path="M120 296 L695 296 L695 306 L120 306 Z",
        tail_x=140, head_x=666, light_y=280, w1=228, w2=580,
    ),
    "suv-silver": dict(
        id="ss", body_light="#c9d0e6", body_dark="#9aa4c4", accent="#5a648c",
        body_path='<path d="M105 300 C105 255 135 228 190 220 L225 155 C238 135 262 122 288 122 L520 122 C548 122 573 135 588 158 L618 220 C662 226 700 246 700 285 L700 300 C700 312 691 320 679 320 L131 320 C118 320 105 312 105 300 Z" fill="url(#body-ss)"/>',
        roof_path="",
        window_path='<path d="M250 216 L272 168 C280 150 298 138 318 138 L490 138 C508 138 524 149 532 166 L556 216 Z" fill="url(#glass-ss)"/><line x1="402" y1="138" x2="402" y2="216" stroke="#9aa4c4" stroke-width="4"/><line x1="330" y1="150" x2="330" y2="216" stroke="#9aa4c4" stroke-width="3" opacity="0.6"/>',
        door_line='<line x1="402" y1="224" x2="402" y2="308" stroke="#5a648c" stroke-width="3" opacity="0.5"/><rect x="422" y="248" width="30" height="6" rx="3" fill="#3f4666"/><path d="M225 158 L618 158" stroke="#7d87ab" stroke-width="6" stroke-linecap="round" opacity="0.7"/>',
        stripe_path="M105 296 L700 296 L700 308 L105 308 Z",
        tail_x=125, head_x=670, light_y=278, w1=215, w2=595,
    ),
    "suv-dark": dict(
        id="sd", body_light="#3a4160", body_dark="#1a1f2e", accent="#0d0f1a",
        body_path='<path d="M105 300 C105 255 135 228 190 220 L225 155 C238 135 262 122 288 122 L520 122 C548 122 573 135 588 158 L618 220 C662 226 700 246 700 285 L700 300 C700 312 691 320 679 320 L131 320 C118 320 105 312 105 300 Z" fill="url(#body-sd)"/>',
        roof_path="",
        window_path='<path d="M250 216 L272 168 C280 150 298 138 318 138 L490 138 C508 138 524 149 532 166 L556 216 Z" fill="url(#glass-sd)"/><line x1="402" y1="138" x2="402" y2="216" stroke="#1a1f2e" stroke-width="4"/><line x1="330" y1="150" x2="330" y2="216" stroke="#1a1f2e" stroke-width="3" opacity="0.6"/>',
        door_line='<line x1="402" y1="224" x2="402" y2="308" stroke="#0d0f1a" stroke-width="3" opacity="0.6"/><rect x="422" y="248" width="30" height="6" rx="3" fill="#000000"/><path d="M225 158 L618 158" stroke="#4a5170" stroke-width="6" stroke-linecap="round" opacity="0.8"/>',
        stripe_path="M105 296 L700 296 L700 308 L105 308 Z",
        tail_x=125, head_x=670, light_y=278, w1=215, w2=595,
    ),
    "deportivo-red": dict(
        id="dr", body_light="#ff5a4f", body_dark="#c41f30", accent="#7a0f1c",
        body_path='<path d="M90 305 C90 275 108 255 145 245 L205 200 L245 155 C262 138 288 128 315 128 L470 128 C495 128 515 140 528 160 L565 210 L640 240 C672 250 705 262 705 292 L705 305 C705 314 697 320 688 320 L107 320 C98 320 90 314 90 305 Z" fill="url(#body-dr)"/>',
        roof_path='<path d="M258 198 L292 158 C302 146 318 138 334 138 L440 138 C456 138 470 146 480 160 L508 198 C480 190 440 186 384 186 C328 186 286 190 258 198 Z" fill="url(#body-dr)"/>',
        window_path='<path d="M266 196 L296 162 C304 152 316 146 328 146 L434 146 C446 146 456 152 464 163 L490 196 C440 190 380 187 378 187 C340 187 296 190 266 196 Z" fill="url(#glass-dr)"/>',
        door_line='<path d="M420 200 C440 240 440 275 425 312" stroke="#7a0f1c" stroke-width="3" opacity="0.5" fill="none"/><path d="M560 175 L610 218" stroke="#5a0a14" stroke-width="10" stroke-linecap="round"/>',
        stripe_path="M90 298 L705 298 L705 308 L90 308 Z M300 132 L470 132 L470 140 L300 140 Z",
        tail_x=108, head_x=676, light_y=282, w1=210, w2=590,
    ),
    "van-white": dict(
        id="vw", body_light="#fbfcff", body_dark="#dfe4f2", accent="#1a3fd6",
        body_path='<path d="M95 300 C95 240 100 175 118 145 C126 130 142 120 160 120 L630 120 C658 120 682 140 690 168 L700 230 C712 236 715 255 715 285 L715 300 C715 312 706 320 694 320 L121 320 C108 320 95 312 95 300 Z" fill="url(#body-vw)" stroke="#c7cee0" stroke-width="2"/>',
        roof_path="",
        window_path='<path d="M148 210 L162 152 C167 136 180 126 196 126 L370 126 L370 210 Z" fill="url(#glass-vw)"/><path d="M382 126 L560 126 C578 126 594 138 599 156 L612 210 L382 210 Z" fill="url(#glass-vw)"/><line x1="376" y1="126" x2="376" y2="210" stroke="#c7cee0" stroke-width="5"/><line x1="470" y1="126" x2="470" y2="210" stroke="#c7cee0" stroke-width="3" opacity="0.7"/>',
        door_line='<line x1="376" y1="218" x2="376" y2="308" stroke="#c7cee0" stroke-width="3"/><line x1="612" y1="218" x2="612" y2="308" stroke="#c7cee0" stroke-width="3"/><rect x="392" y="250" width="34" height="6" rx="3" fill="#9aa4c4"/><rect x="628" y="250" width="30" height="6" rx="3" fill="#9aa4c4"/>',
        stripe_path="M95 292 L715 292 L715 304 L95 304 Z",
        tail_x=112, head_x=686, light_y=278, w1=225, w2=615,
    ),
}

if __name__ == "__main__":
    for name, params in CARS.items():
        svg = TEMPLATE.format(**params)
        with open(f"{name}.svg", "w") as f:
            f.write(svg)
        print("wrote", name + ".svg")
