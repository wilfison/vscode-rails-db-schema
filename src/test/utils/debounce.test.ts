import * as assert from 'assert';
import { debaunce } from '../../utils/debaunce.js';

suite('Debounce Utils Test Suite', () => {
  suite('debaunce', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debaunce(() => {
        callCount++;
      }, 50);

      // Call function multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      assert.strictEqual(callCount, 0);

      // Wait for debounce delay
      setTimeout(() => {
        // Should have been called only once
        assert.strictEqual(callCount, 1);
        done();
      }, 100);
    });

    test('should pass arguments to debounced function', (done) => {
      let receivedArgs: any[] = [];
      const debouncedFn = debaunce((...args: any[]) => {
        receivedArgs = args;
      }, 50);

      debouncedFn('test', 123, true);

      setTimeout(() => {
        assert.deepStrictEqual(receivedArgs, ['test', 123, true]);
        done();
      }, 100);
    });

    test('should use the last call arguments when debounced', (done) => {
      let receivedValue: string = '';
      const debouncedFn = debaunce((value: string) => {
        receivedValue = value;
      }, 50);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      setTimeout(() => {
        assert.strictEqual(receivedValue, 'third');
        done();
      }, 100);
    });

    test('should reset timer on each call', (done) => {
      let callCount = 0;
      const debouncedFn = debaunce(() => {
        callCount++;
      }, 100);

      debouncedFn();

      setTimeout(() => {
        debouncedFn(); // Reset timer
      }, 50);

      setTimeout(() => {
        // Should not have been called yet after 120ms (first call + 50ms)
        assert.strictEqual(callCount, 0);
      }, 120);

      setTimeout(() => {
        // Should have been called once after 200ms (second call + 100ms)
        assert.strictEqual(callCount, 1);
        done();
      }, 200);
    });

    test('should handle multiple debounced functions independently', (done) => {
      let count1 = 0;
      let count2 = 0;

      const debouncedFn1 = debaunce(() => {
        count1++;
      }, 50);

      const debouncedFn2 = debaunce(() => {
        count2++;
      }, 50);

      debouncedFn1();
      debouncedFn1();
      debouncedFn2();
      debouncedFn2();

      setTimeout(() => {
        assert.strictEqual(count1, 1);
        assert.strictEqual(count2, 1);
        done();
      }, 100);
    });

    test('should handle immediate consecutive calls', (done) => {
      let callCount = 0;
      const debouncedFn = debaunce(() => {
        callCount++;
      }, 50);

      // Call 10 times immediately
      for (let i = 0; i < 10; i++) {
        debouncedFn();
      }

      setTimeout(() => {
        assert.strictEqual(callCount, 1);
        done();
      }, 100);
    });

    test('should work with different delay times', (done) => {
      let shortCount = 0;
      let longCount = 0;

      const shortDebounce = debaunce(() => {
        shortCount++;
      }, 30);

      const longDebounce = debaunce(() => {
        longCount++;
      }, 100);

      shortDebounce();
      longDebounce();

      setTimeout(() => {
        assert.strictEqual(shortCount, 1);
        assert.strictEqual(longCount, 0); // Should not have been called yet
      }, 50);

      setTimeout(() => {
        assert.strictEqual(shortCount, 1);
        assert.strictEqual(longCount, 1); // Should have been called now
        done();
      }, 150);
    });
  });
});
