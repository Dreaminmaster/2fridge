# Pocket Fridge validation failure

- Workflow run: `29470650156`
- Source commit: `53ac2f12e14512b2400c25a1a2960efb408523bc`
- Recorded at: 2026-07-16 04:09:12 UTC

```text
  ---
  duration_ms: 0.160472
  type: 'test'
  ...
# Subtest: 3D model renders for 西兰花
ok 37 - 3D model renders for 西兰花
  ---
  duration_ms: 0.383241
  type: 'test'
  ...
# Subtest: 3D model renders for 蘑菇
ok 38 - 3D model renders for 蘑菇
  ---
  duration_ms: 0.193464
  type: 'test'
  ...
# Subtest: 3D model renders for 生菜
ok 39 - 3D model renders for 生菜
  ---
  duration_ms: 0.348005
  type: 'test'
  ...
# Subtest: 3D model renders for 白菜
ok 40 - 3D model renders for 白菜
  ---
  duration_ms: 0.361139
  type: 'test'
  ...
# Subtest: 3D model renders for 豆腐
ok 41 - 3D model renders for 豆腐
  ---
  duration_ms: 0.841302
  type: 'test'
  ...
# Subtest: 3D model renders for 奶酪
ok 42 - 3D model renders for 奶酪
  ---
  duration_ms: 0.172845
  type: 'test'
  ...
# Subtest: 3D model renders for 酸奶
ok 43 - 3D model renders for 酸奶
  ---
  duration_ms: 0.180109
  type: 'test'
  ...
# Subtest: 3D model renders for 苹果
ok 44 - 3D model renders for 苹果
  ---
  duration_ms: 0.275037
  type: 'test'
  ...
# Subtest: 3D model renders for 香蕉
ok 45 - 3D model renders for 香蕉
  ---
  duration_ms: 0.211368
  type: 'test'
  ...
# Subtest: 3D model renders for 柠檬
ok 46 - 3D model renders for 柠檬
  ---
  duration_ms: 0.24982
  type: 'test'
  ...
# Subtest: 3D model renders for 面包
ok 47 - 3D model renders for 面包
  ---
  duration_ms: 0.953022
  type: 'test'
  ...
# Subtest: 3D model renders for 米饭
ok 48 - 3D model renders for 米饭
  ---
  duration_ms: 0.22842
  type: 'test'
  ...
# Subtest: 3D model renders for 可乐
not ok 49 - 3D model renders for 可乐
  ---
  duration_ms: 0.7553
  type: 'test'
  location: '/home/runner/work/2fridge/2fridge/tests/modelRendering.test.mjs:7:3'
  failureType: 'testCodeFailure'
  error: |-
    Converting circular structure to JSON
        --> starting at object with constructor 'Object'
        |     property 'foodRoot' -> object with constructor 'Object'
        |     property 'object' -> object with constructor 'Object'
        |     ...
        |     index 0 -> object with constructor 'Object'
        --- property 'userData' closes the circle
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: |-
    JSON.stringify (<anonymous>)
    Mesh.copy (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:14797:36)
    Mesh.copy (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:20360:9)
    Mesh.clone (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:14756:33)
    createFoodModel (file:///home/runner/work/2fridge/2fridge/src/scene/createFoodModel.js:132:32)
    TestContext.<anonymous> (file:///home/runner/work/2fridge/2fridge/tests/modelRendering.test.mjs:8:19)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
  ...
# Subtest: 3D model renders for 牛奶
ok 50 - 3D model renders for 牛奶
  ---
  duration_ms: 0.983158
  type: 'test'
  ...
# Subtest: 3D model renders for 酱料瓶
ok 51 - 3D model renders for 酱料瓶
  ---
  duration_ms: 0.230113
  type: 'test'
  ...
# Subtest: 3D model renders for 果汁
ok 52 - 3D model renders for 果汁
  ---
  duration_ms: 1.722499
  type: 'test'
  ...
# Subtest: 3D model renders for 矿泉水
ok 53 - 3D model renders for 矿泉水
  ---
  duration_ms: 0.228169
  type: 'test'
  ...
# Subtest: 3D model renders for 气泡水
not ok 54 - 3D model renders for 气泡水
  ---
  duration_ms: 0.656334
  type: 'test'
  location: '/home/runner/work/2fridge/2fridge/tests/modelRendering.test.mjs:7:3'
  failureType: 'testCodeFailure'
  error: |-
    Converting circular structure to JSON
        --> starting at object with constructor 'Object'
        |     property 'foodRoot' -> object with constructor 'Object'
        |     property 'object' -> object with constructor 'Object'
        |     ...
        |     index 0 -> object with constructor 'Object'
        --- property 'userData' closes the circle
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: |-
    JSON.stringify (<anonymous>)
    Mesh.copy (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:14797:36)
    Mesh.copy (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:20360:9)
    Mesh.clone (file:///home/runner/work/2fridge/2fridge/node_modules/three/build/three.core.js:14756:33)
    createFoodModel (file:///home/runner/work/2fridge/2fridge/src/scene/createFoodModel.js:132:32)
    TestContext.<anonymous> (file:///home/runner/work/2fridge/2fridge/tests/modelRendering.test.mjs:8:19)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
  ...
# Subtest: 3D model renders for 番茄酱
ok 55 - 3D model renders for 番茄酱
  ---
  duration_ms: 0.248838
  type: 'test'
  ...
# Subtest: 3D model renders for 蛋黄酱
ok 56 - 3D model renders for 蛋黄酱
  ---
  duration_ms: 0.210175
  type: 'test'
  ...
# Subtest: 3D model renders for 果酱
ok 57 - 3D model renders for 果酱
  ---
  duration_ms: 0.185128
  type: 'test'
  ...
# Subtest: recipe context groups independent inventory instances into normalized ingredients
ok 58 - recipe context groups independent inventory instances into normalized ingredients
  ---
  duration_ms: 3.100796
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
ok 59 - prepareAdd does not consume capacity before commit
  ---
  duration_ms: 1.596182
  type: 'test'
  ...
# Subtest: a failing subscriber cannot interrupt a committed mutation
ok 60 - a failing subscriber cannot interrupt a committed mutation
  ---
  duration_ms: 2.786831
  type: 'test'
  ...
# Subtest: legacy duplicate and invalid slots are repaired on load
ok 61 - legacy duplicate and invalid slots are repaired on load
  ---
  duration_ms: 1.273595
  type: 'test'
  ...
1..61
# tests 61
# suites 0
# pass 58
# fail 3
# cancelled 0
# skipped 0
# todo 0
# duration_ms 342.746206
```
