export function foodIconSvg(food) {
  const [a, b] = food.palette;
  const common = 'class="food-icon" viewBox="0 0 100 100" aria-hidden="true"';
  const shadow = '<ellipse cx="50" cy="81" rx="27" ry="7" fill="rgba(92,60,42,.12)"/>';
  switch (food.model) {
    case 'meatStrip': return `<svg ${common}>${shadow}<g transform="rotate(-16 50 50)"><rect x="25" y="30" width="17" height="48" rx="6" fill="${a}"/><rect x="52" y="24" width="17" height="54" rx="6" fill="${b}"/><path d="M29 38h9M56 34h9" stroke="#f1b2a4" stroke-width="4" stroke-linecap="round"/></g></svg>`;
    case 'cubes': return `<svg ${common}>${shadow}<g fill="${a}" stroke="${b}" stroke-width="2"><path d="M26 41 43 32l16 9-16 10Z"/><path d="m43 51 16-10v20L43 71Z"/><path d="m26 41 17 10v20L26 61Z"/><path d="M53 31 68 23l14 8-14 9Z"/></g></svg>`;
    case 'drumstick': return `<svg ${common}>${shadow}<path d="M34 69c-12-9-9-29 8-41 16-10 31 1 28 16-3 18-22 34-36 25Z" fill="${a}"/><path d="m66 33 12-12c3-3 8 2 5 6l-11 13" stroke="${b}" stroke-width="8" stroke-linecap="round"/></svg>`;
    case 'wing': return `<svg ${common}>${shadow}<path d="M27 62c1-25 23-42 35-29 10 11-2 25-13 31-9 5-20 8-22-2Z" fill="${a}"/><path d="M50 64c6-20 24-27 31-17 7 10-8 27-31 17Z" fill="${b}" opacity=".75"/></svg>`;
    case 'steak': return `<svg ${common}>${shadow}<path d="M22 48c3-21 25-31 47-20 17 8 16 31-4 43-18 11-46 2-43-23Z" fill="${a}"/><path d="M30 39c12-8 29-9 42 0" stroke="${b}" stroke-width="7" stroke-linecap="round"/></svg>`;
    case 'fish': return `<svg ${common}>${shadow}<ellipse cx="49" cy="51" rx="27" ry="17" fill="${a}"/><path d="m23 51-15-13v26Z" fill="${b}"/><circle cx="62" cy="46" r="3" fill="#40362f"/></svg>`;
    case 'shrimp': return `<svg ${common}>${shadow}<path d="M28 62c3-30 39-39 50-15 8 18-9 31-27 25-12-4-17-15-10-24" fill="none" stroke="${a}" stroke-width="12" stroke-linecap="round"/><circle cx="75" cy="45" r="4" fill="${b}"/></svg>`;
    case 'sausage': return `<svg ${common}>${shadow}<g stroke="${b}" stroke-width="3"><rect x="18" y="37" width="64" height="15" rx="8" fill="${a}"/><rect x="22" y="56" width="58" height="15" rx="8" fill="${a}"/></g></svg>`;
    case 'dumpling': return `<svg ${common}>${shadow}<path d="M20 60c3-23 18-34 30-34s27 11 30 34c-15 13-45 13-60 0Z" fill="${a}"/><path d="M31 53c5-9 12-14 19-14s14 5 19 14" fill="none" stroke="${b}" stroke-width="4" stroke-linecap="round"/></svg>`;
    case 'can': return `<svg ${common}>${shadow}<ellipse cx="50" cy="28" rx="23" ry="8" fill="#d9d3c5"/><rect x="27" y="28" width="46" height="46" rx="5" fill="${a}"/><ellipse cx="50" cy="74" rx="23" ry="8" fill="${b}"/><path d="M30 42h40" stroke="#fff" stroke-width="6" opacity=".55"/></svg>`;
    case 'onion': return `<svg ${common}>${shadow}<path d="M50 17c5 10 22 12 23 35 1 21-10 29-23 29S26 73 27 52c1-23 18-25 23-35Z" fill="${a}"/><path d="M50 17c-3 15-6 39 0 64M50 17c8 17 14 40 7 62" stroke="${b}" stroke-width="4" fill="none" opacity=".65"/></svg>`;
    case 'greens': return `<svg ${common}>${shadow}<g stroke="${a}" stroke-width="8" stroke-linecap="round"><path d="M30 72 45 25"/><path d="M41 75 51 20"/><path d="M51 74 60 25"/><path d="M61 72 69 31"/></g><path d="M27 69h39" stroke="${b}" stroke-width="7" stroke-linecap="round"/></svg>`;
    case 'corn': return `<svg ${common}>${shadow}<rect x="28" y="31" width="44" height="40" rx="20" fill="${a}"/><g stroke="${b}" stroke-width="3" opacity=".7"><path d="M40 32v38M52 32v38M64 35v32M30 45h40M29 57h42"/></g></svg>`;
    case 'tomato': return `<svg ${common}>${shadow}<circle cx="50" cy="54" r="27" fill="${a}"/><path d="m50 28 7 10 12-2-9 8 5 10-15-6-15 6 5-10-9-8 12 2Z" fill="${b}"/></svg>`;
    case 'fruit': return `<svg ${common}>${shadow}<circle cx="50" cy="53" r="27" fill="${a}"/><path d="M50 27c2-10 9-13 16-11" stroke="${b}" stroke-width="6" stroke-linecap="round"/></svg>`;
    case 'root': return `<svg ${common}>${shadow}<ellipse cx="50" cy="54" rx="30" ry="23" fill="${a}"/><circle cx="39" cy="49" r="3" fill="${b}"/><circle cx="59" cy="59" r="3" fill="${b}"/></svg>`;
    case 'carrot': return `<svg ${common}>${shadow}<path d="M35 30h30L50 76Z" fill="${a}"/><path d="M45 31 37 17M52 30V14M59 31l9-13" stroke="${b}" stroke-width="6" stroke-linecap="round"/></svg>`;
    case 'broccoli': return `<svg ${common}>${shadow}<rect x="43" y="48" width="14" height="31" rx="6" fill="${b}"/><g fill="${a}"><circle cx="35" cy="41" r="15"/><circle cx="51" cy="34" r="17"/><circle cx="67" cy="42" r="14"/><circle cx="50" cy="49" r="16"/></g></svg>`;
    case 'mushroom': return `<svg ${common}>${shadow}<rect x="43" y="49" width="14" height="28" rx="6" fill="${b}"/><path d="M24 51c2-23 14-33 26-33s24 10 26 33Z" fill="${a}"/></svg>`;
    case 'leafy': return `<svg ${common}>${shadow}<g fill="${a}"><ellipse cx="36" cy="55" rx="16" ry="28" transform="rotate(-25 36 55)"/><ellipse cx="55" cy="48" rx="17" ry="30"/><ellipse cx="67" cy="58" rx="15" ry="25" transform="rotate(28 67 58)"/></g><path d="M50 33v42" stroke="${b}" stroke-width="5"/></svg>`;
    case 'box':
    case 'tofu': return `<svg ${common}>${shadow}<path d="M24 38 53 24l25 13-29 15Z" fill="${b}"/><path d="m24 38 25 14v27L24 65Z" fill="${a}"/><path d="m49 52 29-15v27L49 79Z" fill="${a}" opacity=".78"/></svg>`;
    case 'cheese': return `<svg ${common}>${shadow}<path d="M24 68 73 30v39Z" fill="${a}"/><circle cx="57" cy="49" r="5" fill="${b}"/><circle cx="45" cy="62" r="4" fill="${b}"/></svg>`;
    case 'carton': return `<svg ${common}>${shadow}<path d="m31 31 13-13h22l8 14v47H31Z" fill="${a}"/><path d="M31 31h43v17H31Z" fill="${b}"/><path d="m44 18 7 13" stroke="${b}" stroke-width="4"/></svg>`;
    case 'eggs': return `<svg ${common}>${shadow}<path d="M22 57h56l-5 21H27Z" fill="${b}"/><g fill="${a}"><ellipse cx="32" cy="49" rx="10" ry="14"/><ellipse cx="50" cy="46" rx="10" ry="15"/><ellipse cx="68" cy="49" rx="10" ry="14"/></g></svg>`;
    case 'bottle': return `<svg ${common}>${shadow}<path d="M43 20h14v12l8 11v35H35V43l8-11Z" fill="${a}"/><rect x="42" y="14" width="16" height="10" rx="3" fill="${b}"/></svg>`;
    case 'jar': return `<svg ${common}>${shadow}<rect x="31" y="31" width="38" height="48" rx="10" fill="${a}"/><rect x="29" y="24" width="42" height="12" rx="5" fill="${b}"/></svg>`;
    case 'cup': return `<svg ${common}>${shadow}<path d="M31 31h38l-5 47H36Z" fill="${a}"/><rect x="29" y="25" width="42" height="10" rx="5" fill="${b}"/></svg>`;
    case 'banana': return `<svg ${common}>${shadow}<path d="M25 35c7 32 31 43 52 18-5 22-20 32-36 26-17-6-25-22-25-40Z" fill="${a}"/><path d="M25 35c7 8 12 10 18 11" stroke="${b}" stroke-width="5"/></svg>`;
    case 'bread': return `<svg ${common}>${shadow}<path d="M26 72V42c0-14 10-23 24-23s24 9 24 23v30Z" fill="${a}"/><path d="M38 34c4-5 8-7 12-7s8 2 12 7" stroke="${b}" stroke-width="5" fill="none"/></svg>`;
    case 'bowl': return `<svg ${common}>${shadow}<path d="M24 48h52c-3 20-12 31-26 31S27 68 24 48Z" fill="${b}"/><ellipse cx="50" cy="47" rx="26" ry="10" fill="${a}"/></svg>`;
    default: return `<svg ${common}>${shadow}<circle cx="50" cy="50" r="27" fill="${a}"/></svg>`;
  }
}
