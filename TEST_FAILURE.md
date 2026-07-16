# Pocket Fridge validation failure

- Workflow run: `29472753557`
- Source commit: `b6bf03180b178babd224ec631b07af015e4df4fb`
- Recorded at: 2026-07-16 05:00:49 UTC

```text
not ok 9 - back row remains raised and visible after the front row fills
  ---
  duration_ms: 6.452469
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
  duration_ms: 43.507869
  type: 'test'
  ...
# Subtest: 3D model renders for 羊肉条
ok 11 - 3D model renders for 羊肉条
  ---
  duration_ms: 11.762303
  type: 'test'
  ...
# Subtest: 3D model renders for 鸡肉块

--- test totals ---
ok 292 - legacy duplicate and invalid slots are repaired on load
  ---
  duration_ms: 1.412207
  type: 'test'
  ...
1..292
# tests 292
# suites 0
# pass 291
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 669.166187
```
