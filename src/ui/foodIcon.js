export function foodIconSvg(food) {
  const [a, b] = food.palette;
  const common = 'class="food-icon" viewBox="0 0 100 100" aria-hidden="true"';
  const shadow = '<ellipse cx="50" cy="81" rx="27" ry="7" fill="rgba(92,60,42,.12)"/>';
  switch (food.model) {
    case 'meatStrip': return `<svg ${common}>${shadow}<g transform="rotate(-16 50 50)"><rect x="25" y="30" width="17" height="48" rx="6" fill="${a}"/><rect x="52" y="24" width="17" height="54" rx="6" fill="${b}"/><path d="M29 38h9M56 34h9" stroke="#f1b2a4" stroke-width="4" stroke-linecap="round"/></g></svg>`;
    case 'cubes': return `<svg ${common}>${shadow}<g fill="${a}" stroke="${b}" stroke-width="2"><path d="M26 41 43 32l16 9-16 10Z"/><path d="m43 51 16-10v20L43 71Z"/><path d="m26 41 17 10v20L26 61Z"/><path d="M53 31 68 23l14 8-14 9Z"/></g></svg>`;
    case 'drumstick': return `<svg ${common}>${shadow}<path d="M34 69c-12-9-9-29 8-41 16-10 31 1 28 16-3 18-22 34-36 25Z" fill="${a}"/><path d="m66 33 12-12c3-3 8 2 5 6l-11 13" stroke="${b}" stroke-width="8" stroke-linecap="round"/></svg>`;
    case 'wing': return `<svg ${common}>${shadow}<path d="M27 62c1-25 23-42 35-29 10 11-2 25-13 31-9 5-20 8-22-2Z" fill="${a}"/><path d="M50 64c6-20 24-27 31-17 7 10-8 27-31 17Z" fill="${b}" opacity=".75"/></svg>`;
    case 'can': return `<svg ${common}>${shadow}<ellipse cx="50" cy="28" rx="23" ry="8" fill="#d9d3c5"/><rect x="27" y="28" width="46" height="46" rx="5" fill="${a}"/><ellipse cx="50" cy="74" rx="23" ry="8" fill="${b}"/><path d="M30 42h40" stroke="#fff" stroke-width="6" opacity=".55"/></svg>`;
    case 'onion': return `<svg ${common}>${shadow}<path d="M50 17c5 10 22 12 23 35 1 21-10 29-23 29S26 73 27 52c1-23 18-25 23-35Z" fill="${a}"/><path d="M50 17c-3 15-6 39 0 64M50 17c8 17 14 40 7 62" stroke="${b}" stroke-width="4" fill="none" opacity=".65"/></svg>`;
    case 'greens': return `<svg ${common}>${shadow}<g stroke="${a}" stroke-width="8" stroke-linecap="round"><path d="M30 72 45 25"/><path d="M41 75 51 20"/><path d="M51 74 60 25"/><path d="M61 72 69 31"/></g><path d="M27 69h39" stroke="${b}" stroke-width="7" stroke-linecap="round"/></svg>`;
    case 'box': return `<svg ${common}>${shadow}<path d="M24 38 53 24l25 13-29 15Z" fill="${b}"/><path d="m24 38 25 14v27L24 65Z" fill="${a}"/><path d="m49 52 29-15v27L49 79Z" fill="${a}" opacity=".78"/></svg>`;
    case 'carton': return `<svg ${common}>${shadow}<path d="m31 31 13-13h22l8 14v47H31Z" fill="${a}"/><path d="M31 31h43v17H31Z" fill="${b}"/><path d="m44 18 7 13" stroke="${b}" stroke-width="4"/></svg>`;
    case 'eggs': return `<svg ${common}>${shadow}<path d="M22 57h56l-5 21H27Z" fill="${b}"/><g fill="${a}"><ellipse cx="32" cy="49" rx="10" ry="14"/><ellipse cx="50" cy="46" rx="10" ry="15"/><ellipse cx="68" cy="49" rx="10" ry="14"/></g></svg>`;
    case 'bottle': return `<svg ${common}>${shadow}<path d="M43 20h14v12l8 11v35H35V43l8-11Z" fill="${a}"/><rect x="42" y="14" width="16" height="10" rx="3" fill="${b}"/></svg>`;
    default: return `<svg ${common}>${shadow}<circle cx="50" cy="50" r="27" fill="${a}"/></svg>`;
  }
}
