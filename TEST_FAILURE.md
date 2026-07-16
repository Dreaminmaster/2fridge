# Pocket Fridge validation failure

- Workflow run: `29472707995`
- Source commit: `51f776cfce4b7329e00efe68553d60bd7b433c24`
- Recorded at: 2026-07-16 05:00:04 UTC

```text
not ok 3 - all slots stay within the deep cabinet cavity
  ---
  duration_ms: 2.834041
  type: 'test'
  location: '/home/runner/work/2fridge/2fridge/tests/fridgeLayout.test.mjs:22:1'
  failureType: 'testCodeFailure'
  error: |-
    The expression evaluated to a falsy value:
    
      assert.ok(slot.scale <= 0.7)
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: '=='
  stack: |-
    file:///home/runner/work/2fridge/2fridge/tests/fridgeLayout.test.mjs:27:14
    Array.forEach (<anonymous>)
    TestContext.<anonymous> (file:///home/runner/work/2fridge/2fridge/tests/fridgeLayout.test.mjs:24:23)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: capacity is enforced per storage zone and overfilling is rejected
ok 4 - capacity is enforced per storage zone and overfilling is rejected
  ---
  duration_ms: 2.845241
  type: 'test'
  ...
# Subtest: removing one item frees its exact slot for reuse
ok 5 - removing one item frees its exact slot for reuse
  ---
  duration_ms: 1.051739
  type: 'test'
not ok 9 - back row remains raised and visible after the front row fills
  ---
  duration_ms: 4.35975
  type: 'test'
  location: '/home/runner/work/2fridge/2fridge/tests/mobileVisibility.test.mjs:35:1'
  failureType: 'testCodeFailure'
  error: |-
    The expression evaluated to a falsy value:
    
      assert.ok(back.y > front.y)
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  actual: false
  operator: '=='
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/2fridge/2fridge/tests/mobileVisibility.test.mjs:40:10)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: 3D model renders for 牛肉条
ok 10 - 3D model renders for 牛肉条
  ---
  duration_ms: 37.844973
  type: 'test'
  ...
# Subtest: 3D model renders for 羊肉条
ok 11 - 3D model renders for 羊肉条
  ---
  duration_ms: 8.597844
  type: 'test'
  ...
# Subtest: 3D model renders for 鸡肉块

--- test totals ---
ok 292 - legacy duplicate and invalid slots are repaired on load
  ---
  duration_ms: 0.805913
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
# duration_ms 407.021162
```
