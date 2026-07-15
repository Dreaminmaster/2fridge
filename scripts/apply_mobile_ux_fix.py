from pathlib import Path

path = Path("src/main.js")
text = path.read_text(encoding="utf-8")

replacements = [
    (
        """  const innerPanel = rounded(4.15, height - .48, .18, .20, materials.cream);\n  innerPanel.position.set(-2.38, 0, -.05);\n""",
        """  const innerPanel = rounded(4.15, height - .48, .18, .20, materials.cream);\n  innerPanel.position.set(-2.38, 0, -.22);\n""",
    ),
    (
        """    rackBack.position.set(-2.38, (i - (racks - 1) / 2) * 1.22, -.26);\n    const rail = rounded(3.52, .18, .48, .06, materials.white);\n    rail.position.set(-2.38, rackBack.position.y - .25, -.48);\n""",
        """    rackBack.position.set(-2.38, (i - (racks - 1) / 2) * 1.22, -.38);\n    const rail = rounded(3.52, .18, .48, .06, materials.white);\n    rail.position.set(-2.38, rackBack.position.y - .25, -.64);\n""",
    ),
    (
        "function saveInventory() { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.inventory)); }",
        "function saveInventory() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.inventory)); } catch {} }",
    ),
    (
        """function render() {\n  const dt = Math.min(clock.getDelta(), .05);\n  const upperTarget = appState.upperOpen ? -1.92 : 0;\n  const lowerTarget = appState.lowerOpen ? -1.80 : 0;\n  fridge.upperDoor.pivot.rotation.y = damp(fridge.upperDoor.pivot.rotation.y, upperTarget, 7.5, dt);\n  fridge.lowerDoor.pivot.rotation.y = damp(fridge.lowerDoor.pivot.rotation.y, lowerTarget, 7.5, dt);\n""",
        """function render() {\n  const dt = Math.min(clock.getDelta(), .05);\n  const upperTarget = appState.upperOpen ? 2.25 : 0;\n  const lowerTarget = appState.lowerOpen ? 2.18 : 0;\n  const portrait = els.stage.clientHeight > els.stage.clientWidth * 1.1;\n  const anyDoorOpen = appState.upperOpen || appState.lowerOpen;\n  const closedScale = portrait ? (els.stage.clientWidth < 390 ? .68 : .70) : .95;\n  const openScale = portrait ? .54 : .82;\n  const targetScale = anyDoorOpen ? openScale : closedScale;\n  const targetX = portrait ? (anyDoorOpen ? -1.15 : -.5) : -.35;\n\n  fridge.group.scale.setScalar(damp(fridge.group.scale.x, targetScale, 5.5, dt));\n  fridge.group.position.x = damp(fridge.group.position.x, targetX, 5.5, dt);\n  fridge.upperDoor.pivot.rotation.y = damp(fridge.upperDoor.pivot.rotation.y, upperTarget, 7.5, dt);\n  fridge.lowerDoor.pivot.rotation.y = damp(fridge.lowerDoor.pivot.rotation.y, lowerTarget, 7.5, dt);\n""",
    ),
    (
        """  if (portrait) {\n    camera.position.set(8.9, 3.1, 14.4);\n    camera.lookAt(-.1, .15, 0);\n    camera.fov = width < 390 ? 39 : 36;\n    fridge.group.scale.setScalar(width < 390 ? .88 : .96);\n  } else {\n    camera.position.set(10.5, 2.4, 15.8);\n    camera.lookAt(-.25, .2, 0);\n    camera.fov = 31;\n    fridge.group.scale.setScalar(1.03);\n  }\n""",
        """  if (portrait) {\n    camera.position.set(-12, 2.4, 14.5);\n    camera.lookAt(-.3, .2, 0);\n    camera.fov = width < 390 ? 38 : 36;\n    fridge.group.position.x = -.5;\n    fridge.group.scale.setScalar(width < 390 ? .68 : .70);\n  } else {\n    camera.position.set(-11.5, 2.4, 15);\n    camera.lookAt(-.25, .2, 0);\n    camera.fov = 33;\n    fridge.group.position.x = -.35;\n    fridge.group.scale.setScalar(.95);\n  }\n""",
    ),
]

changed = False
for old, new in replacements:
    if old in text:
        text = text.replace(old, new)
        changed = True
    elif new in text:
        continue
    else:
        raise SystemExit(f"Expected source block was not found:\n{old[:180]}")

if changed:
    path.write_text(text, encoding="utf-8")
    print("Applied mobile framing and door interior fix.")
else:
    print("Mobile framing and door interior fix already applied.")
