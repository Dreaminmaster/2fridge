# Pocket Fridge validation failure

- Workflow run: `29472660027`
- Source commit: `cf645850dca5487792fdc3b4811338d163f724ef`
- Recorded at: 2026-07-16 04:58:41 UTC

```text
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 0
ok 260 - 可乐 rests inside door slot 0
  ---
  duration_ms: 0.26269
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 4
ok 261 - 可乐 rests inside door slot 4
  ---
  duration_ms: 0.257923
  type: 'test'
  ...
# Subtest: 可乐 rests inside door slot 8
ok 262 - 可乐 rests inside door slot 8
  ---
  duration_ms: 0.28291
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 0
ok 263 - 牛奶 rests inside door slot 0
  ---
  duration_ms: 0.967285
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 4
ok 264 - 牛奶 rests inside door slot 4
  ---
  duration_ms: 1.033853
  type: 'test'
  ...
# Subtest: 牛奶 rests inside door slot 8
ok 265 - 牛奶 rests inside door slot 8
  ---
  duration_ms: 0.971551
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 0
ok 266 - 酱料瓶 rests inside door slot 0
  ---
  duration_ms: 0.239525
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 4
ok 267 - 酱料瓶 rests inside door slot 4
  ---
  duration_ms: 0.205765
  type: 'test'
  ...
# Subtest: 酱料瓶 rests inside door slot 8
ok 268 - 酱料瓶 rests inside door slot 8
  ---
  duration_ms: 0.20168
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 0
ok 269 - 果汁 rests inside door slot 0
  ---
  duration_ms: 1.306428
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 4
ok 270 - 果汁 rests inside door slot 4
  ---
  duration_ms: 1.506095
  type: 'test'
  ...
# Subtest: 果汁 rests inside door slot 8
ok 271 - 果汁 rests inside door slot 8
  ---
  duration_ms: 1.080082
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 0
ok 272 - 矿泉水 rests inside door slot 0
  ---
  duration_ms: 0.260847
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 4
ok 273 - 矿泉水 rests inside door slot 4
  ---
  duration_ms: 0.212315
  type: 'test'
  ...
# Subtest: 矿泉水 rests inside door slot 8
ok 274 - 矿泉水 rests inside door slot 8
  ---
  duration_ms: 0.214478
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 0
ok 275 - 气泡水 rests inside door slot 0
  ---
  duration_ms: 1.343418
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 4
ok 276 - 气泡水 rests inside door slot 4
  ---
  duration_ms: 0.557037
  type: 'test'
  ...
# Subtest: 气泡水 rests inside door slot 8
ok 277 - 气泡水 rests inside door slot 8
  ---
  duration_ms: 0.516987
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 0
ok 278 - 番茄酱 rests inside door slot 0
  ---
  duration_ms: 0.387465
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 4
ok 279 - 番茄酱 rests inside door slot 4
  ---
  duration_ms: 0.39086
  type: 'test'
  ...
# Subtest: 番茄酱 rests inside door slot 8
ok 280 - 番茄酱 rests inside door slot 8
  ---
  duration_ms: 0.430959
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 0
ok 281 - 蛋黄酱 rests inside door slot 0
  ---
  duration_ms: 0.373834
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 4
ok 282 - 蛋黄酱 rests inside door slot 4
  ---
  duration_ms: 0.402858
  type: 'test'
  ...
# Subtest: 蛋黄酱 rests inside door slot 8
ok 283 - 蛋黄酱 rests inside door slot 8
  ---
  duration_ms: 0.389508
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 0
ok 284 - 果酱 rests inside door slot 0
  ---
  duration_ms: 0.315578
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 4
ok 285 - 果酱 rests inside door slot 4
  ---
  duration_ms: 0.305103
  type: 'test'
  ...
# Subtest: 果酱 rests inside door slot 8
ok 286 - 果酱 rests inside door slot 8
  ---
  duration_ms: 0.329659
  type: 'test'
  ...
# Subtest: adjacent shelf slots keep a collision-safe horizontal gap
ok 287 - adjacent shelf slots keep a collision-safe horizontal gap
  ---
  duration_ms: 0.53217
  type: 'test'
  ...
# Subtest: front and back rows have separate depth envelopes
ok 288 - front and back rows have separate depth envelopes
  ---
  duration_ms: 0.199717
  type: 'test'
  ...
# Subtest: recipe context groups independent inventory instances into normalized ingredients
ok 289 - recipe context groups independent inventory instances into normalized ingredients
  ---
  duration_ms: 1.659242
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
  duration_ms: 1.959067
  type: 'test'
  ...
# Subtest: a failing subscriber cannot interrupt a committed mutation
ok 291 - a failing subscriber cannot interrupt a committed mutation
  ---
  duration_ms: 3.847148
  type: 'test'
  ...
# Subtest: legacy duplicate and invalid slots are repaired on load
ok 292 - legacy duplicate and invalid slots are repaired on load
  ---
  duration_ms: 1.323023
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
# duration_ms 650.183604
```
