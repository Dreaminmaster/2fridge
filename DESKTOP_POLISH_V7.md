# Pocket Fridge desktop and model polish

- Desktop users can switch between rotate mode and fridge move mode.
- Move mode drags the fridge across the floor while preserving grounding.
- Reset view restores both camera and fridge position.
- Distance fog was removed so zoomed-out views remain crisp.
- Fridge vertical placement is recalculated from its real lower bound at every responsive scale, preventing the base from clipping through the floor.
- Existing food models now receive category-specific low-poly detail passes such as trays, labels, lids, pull tabs, caps, produce marks, egg cartons, cheese holes, bread scoring and bowl accessories.
- Added details are measured before slot fitting, so richer models remain inside their collision envelopes.
