import * as assert from 'assert';
import { rubyHashToJson } from '../../utils/json.js';

suite('JSON Utils Test Suite', () => {
  suite('rubyHashToJson', () => {
    test('should convert Ruby hash rocket syntax to JSON', () => {
      const rubyHash = '{ :name => "John", :age => 30 }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { name: 'John', age: 30 });
    });

    test('should convert Ruby 1.9+ symbol keys to JSON', () => {
      const rubyHash = '{ name: "John", age: 30 }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { name: 'John', age: 30 });
    });

    test('should convert single quotes to double quotes', () => {
      const rubyHash = "{ 'name': 'John', 'age': 30 }";
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { name: 'John', age: 30 });
    });

    test('should convert Ruby nil to JSON null', () => {
      const rubyHash = '{ default: nil }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { default: null });
    });

    test('should handle boolean values', () => {
      const rubyHash = '{ enabled: true, disabled: false }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { enabled: true, disabled: false });
    });

    test('should handle numeric values', () => {
      const rubyHash = '{ limit: 255, precision: 10, scale: 2, ratio: 1.5 }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, {
        limit: 255,
        precision: 10,
        scale: 2,
        ratio: 1.5,
      });
    });

    test('should handle nested hashes', () => {
      const rubyHash = '{ user: { name: "John", age: 30 } }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { user: { name: 'John', age: 30 } });
    });

    test('should remove block parameters', () => {
      const rubyHash = '{ name: "test" do |t| }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { name: 'test' });
    });

    test('should handle arrays', () => {
      const rubyHash = '{ tags: ["ruby", "rails", "vscode"] }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { tags: ['ruby', 'rails', 'vscode'] });
    });

    test('should handle mixed symbol and string keys', () => {
      const rubyHash = '{ :name => "John", "age" => 30, city: "NYC" }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, { name: 'John', age: 30, city: 'NYC' });
    });

    test('should return empty object for invalid JSON', () => {
      const rubyHash = '{ this is not valid }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, {});
    });

    test('should handle empty hash', () => {
      const rubyHash = '{}';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, {});
    });

    test('should handle complex schema attributes', () => {
      const rubyHash = '{ default: "pending", null: false, limit: 255 }';
      const result = rubyHashToJson(rubyHash);
      assert.deepStrictEqual(result, {
        default: 'pending',
        null: false,
        limit: 255,
      });
    });
  });
});
