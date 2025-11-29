import * as assert from 'assert';
import { filterColumnAttributes } from '../../utils/columns.js';
import { SchemaColumnAttributes } from '../../schema_node.js';

suite('Columns Utils Test Suite', () => {
  suite('filterColumnAttributes', () => {
    test('should return empty string for unknown column types without null constraint', () => {
      const attributes: SchemaColumnAttributes = {};
      const result = filterColumnAttributes('unknown_type', attributes);
      assert.strictEqual(result, '');
    });

    test('should return "Not Null" for unknown column types with null: false', () => {
      const attributes: SchemaColumnAttributes = { null: false };
      const result = filterColumnAttributes('unknown_type', attributes);
      assert.strictEqual(result, 'Not Null');
    });

    test('should filter string attributes correctly', () => {
      const attributes: SchemaColumnAttributes = {
        limit: 255,
        default: 'test',
        null: false,
      };
      const result = filterColumnAttributes('string', attributes);
      assert.strictEqual(result, 'limit: 255, default: test, Not Null');
    });

    test('should filter text attributes correctly', () => {
      const attributes: SchemaColumnAttributes = {
        limit: 1000,
      };
      const result = filterColumnAttributes('text', attributes);
      assert.strictEqual(result, 'limit: 1000');
    });

    test('should filter integer attributes correctly', () => {
      const attributes: SchemaColumnAttributes = {
        limit: 8,
        default: 0,
      };
      const result = filterColumnAttributes('integer', attributes);
      assert.strictEqual(result, 'limit: 8, default: 0');
    });

    test('should filter decimal attributes with precision and scale', () => {
      const attributes: SchemaColumnAttributes = {
        precision: 10,
        scale: 2,
        default: 0.0,
      };
      const result = filterColumnAttributes('decimal', attributes);
      assert.strictEqual(result, '8.2, default: 0');
    });

    test('should filter float attributes correctly', () => {
      const attributes: SchemaColumnAttributes = {
        default: 1.5,
      };
      const result = filterColumnAttributes('float', attributes);
      assert.strictEqual(result, 'default: 1.5');
    });

    test('should filter boolean attributes correctly', () => {
      const attributes: SchemaColumnAttributes = {
        default: false,
        null: false,
      };
      const result = filterColumnAttributes('boolean', attributes);
      assert.strictEqual(result, 'default: false, Not Null');
    });

    test('should handle null default values', () => {
      const attributes: SchemaColumnAttributes = {
        default: null,
      };
      const result = filterColumnAttributes('string', attributes);
      assert.strictEqual(result, 'default: null');
    });

    test('should handle alias types (int, bigint, bool)', () => {
      const intAttrs: SchemaColumnAttributes = { limit: 4 };
      const bigintAttrs: SchemaColumnAttributes = { limit: 8 };
      const boolAttrs: SchemaColumnAttributes = { default: true };

      assert.strictEqual(filterColumnAttributes('int', intAttrs), 'limit: 4');
      assert.strictEqual(filterColumnAttributes('bigint', bigintAttrs), 'limit: 8');
      assert.strictEqual(filterColumnAttributes('bool', boolAttrs), 'default: true');
    });

    test('should handle empty attributes', () => {
      const attributes: SchemaColumnAttributes = {};
      assert.strictEqual(filterColumnAttributes('string', attributes), '');
      assert.strictEqual(filterColumnAttributes('integer', attributes), '');
      assert.strictEqual(filterColumnAttributes('decimal', attributes), '');
    });

    test('should only show relevant attributes per type', () => {
      const attributes: SchemaColumnAttributes = {
        limit: 255,
        precision: 10,
        scale: 2,
        default: 'test',
      };
      
      // String should only show limit and default, not precision/scale
      const stringResult = filterColumnAttributes('string', attributes);
      assert.ok(stringResult.includes('limit: 255'));
      assert.ok(stringResult.includes('default: test'));
      assert.ok(!stringResult.includes('precision'));
      assert.ok(!stringResult.includes('scale'));
    });
  });
});
