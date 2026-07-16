# Pocket Fridge validation failure

- Workflow run: `29472621940`
- Source commit: `106f6d8b794c5a43ebda84f57649c0b340ea11a1`
- Recorded at: 2026-07-16 04:57:49 UTC

```text
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 0
ok 260 - 可乐 rests inside door slot 0
  ---
  duration_ms: 0.292276
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 4
ok 261 - 可乐 rests inside door slot 4
  ---
  duration_ms: 0.347479
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 8
ok 262 - 可乐 rests inside door slot 8
  ---
  duration_ms: 0.293398
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 0
ok 263 - 牛奶 rests inside door slot 0
  ---
  duration_ms: 0.962238
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 4
ok 264 - 牛奶 rests inside door slot 4
  ---
  duration_ms: 0.961477
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 8
ok 265 - 牛奶 rests inside door slot 8
  ---
  duration_ms: 1.525241
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 0
ok 266 - 酱料瓶 rests inside door slot 0
  ---
  duration_ms: 0.297255
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 4
ok 267 - 酱料瓶 rests inside door slot 4
  ---
  duration_ms: 0.23562
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 8
ok 268 - 酱料瓶 rests inside door slot 8
  ---
  duration_ms: 0.241652
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 0
ok 269 - 果汁 rests inside door slot 0
  ---
  duration_ms: 0.981785
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 4
ok 270 - 果汁 rests inside door slot 4
  ---
  duration_ms: 0.966736
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 8
ok 271 - 果汁 rests inside door slot 8
  ---
  duration_ms: 0.989449
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 0
ok 272 - 矿泉水 rests inside door slot 0
  ---
  duration_ms: 0.284362
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 4
ok 273 - 矿泉水 rests inside door slot 4
  ---
  duration_ms: 0.232154
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 8
ok 274 - 矿泉水 rests inside door slot 8
  ---
  duration_ms: 0.21916
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 0
ok 275 - 气泡水 rests inside door slot 0
  ---
  duration_ms: 0.319988
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 4
ok 276 - 气泡水 rests inside door slot 4
  ---
  duration_ms: 0.342761
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 8
ok 277 - 气泡水 rests inside door slot 8
  ---
  duration_ms: 0.349152
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 0
ok 278 - 番茄酱 rests inside door slot 0
  ---
  duration_ms: 0.228357
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 4
ok 279 - 番茄酱 rests inside door slot 4
  ---
  duration_ms: 0.272349
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 8
ok 280 - 番茄酱 rests inside door slot 8
  ---
  duration_ms: 0.220612
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 0
ok 281 - 蛋黄酱 rests inside door slot 0
  ---
  duration_ms: 0.219209
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 4
ok 282 - 蛋黄酱 rests inside door slot 4
  ---
  duration_ms: 0.218658
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 8
ok 283 - 蛋黄酱 rests inside door slot 8
  ---
  duration_ms: 0.249366
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 0
ok 284 - 果酱 rests inside door slot 0
  ---
  duration_ms: 0.189364
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 4
ok 285 - 果酱 rests inside door slot 4
  ---
  duration_ms: 0.189414
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 8
ok 286 - 果酱 rests inside door slot 8
  ---
  duration_ms: 0.178283
  type: 'test'
  ...
# Subtest: adjacent shelf slots keep a collision-safe horizontal gap
ok 287 - adjacent shelf slots keep a collision-safe horizontal gap
  ---
  duration_ms: 0.409124
  type: 'test'
  ...
# Subtest: front and back rows have separate depth envelopes
ok 288 - front and back rows have separate depth envelopes
  ---
  duration_ms: 0.138489
  type: 'test'
  ...
# Subtest: recipe context groups independent inventory instances into normalized ingredients
ok 289 - recipe context groups independent inventory instances into normalized ingredients
  ---
  duration_ms: 2.361372
  type: 'test'
  ...
# Pocket Fridge subscriber failed: Error: render failed
#     at file:///home/runner/work/2fridge/2fridge/tests/transactionalInventory.test.mjs:29:33
#     at file:///home/runner/work/2fridge/2fridge/src/domain/inventoryStore.js:105:9
#     at Set.forEach (<anonymous>)
#     at persist (file:///home/runner/work/2fridge/2fridge/src/domain/inventoryStore.js:103:15)
#     at commitPrepared (file:///home/runner/work/2fridge/2fridge/src/domain/inventoryStore.js:58:5)
#     at Object.add (file:///home/runner/work/2fridge/2fridge/src/domain/inventoryStore.js:64:26)
#     at TestContext.<anonymous> (file:///home/runner/work/2fridge/2fridge/tests/transactionalInventory.test.mjs:30:24)
#     at Test.runInAsyncScope (node:async_hooks:214:14)
#     at Test.run (node:internal/test_runner/test:1047:25)
#     at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
# Subtest: prepareAdd does not consume capacity before commit
ok 290 - prepareAdd does not consume capacity before commit
  ---
  duration_ms: 2.2158
  type: 'test'
  ...
# Subtest: a failing subscriber cannot interrupt a committed mutation
ok 291 - a failing subscriber cannot interrupt a committed mutation
  ---
  duration_ms: 3.754796
  type: 'test'
  ...
# Subtest: legacy duplicate and invalid slots are repaired on load
ok 292 - legacy duplicate and invalid slots are repaired on load
  ---
  duration_ms: 1.377855
  type: 'test'
  ...
1..292
# tests 292
# suites 0
# pass 290
# fail 2
# cancelled 0
# skipped 0
# todo 0
# duration_ms 710.247794
```
