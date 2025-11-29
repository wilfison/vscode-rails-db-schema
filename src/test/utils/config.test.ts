import * as assert from 'assert';
import * as vscode from 'vscode';
import { getConfig, RAILS_INTERNAL_TABLES, TIMESTAMP_COLUMNS } from '../../utils/config.js';

suite('Config Utils Test Suite', () => {
  suite('getConfig', () => {
    test('should return config object with all properties', () => {
      const config = getConfig();

      assert.ok(config);
      assert.ok('autoReveal' in config);
      assert.ok('showIndexes' in config);
      assert.ok('showTimestamps' in config);
      assert.ok('showRailsTables' in config);
    });

    test('should return boolean values for all config properties', () => {
      const config = getConfig();

      assert.strictEqual(typeof config.autoReveal, 'boolean');
      assert.strictEqual(typeof config.showIndexes, 'boolean');
      assert.strictEqual(typeof config.showTimestamps, 'boolean');
      assert.strictEqual(typeof config.showRailsTables, 'boolean');
    });

    test('should have default values', () => {
      const config = getConfig();

      // Default values should be true
      assert.strictEqual(config.autoReveal, true);
      assert.strictEqual(config.showIndexes, true);
      assert.strictEqual(config.showTimestamps, true);
      assert.strictEqual(config.showRailsTables, true);
    });

    test('should read from VS Code configuration', () => {
      const vscodeConfig = vscode.workspace.getConfiguration('rails-schemas');
      const utilConfig = getConfig();

      assert.strictEqual(
        utilConfig.autoReveal,
        vscodeConfig.get<boolean>('autoReveal', true)
      );
      assert.strictEqual(
        utilConfig.showIndexes,
        vscodeConfig.get<boolean>('showIndexes', true)
      );
      assert.strictEqual(
        utilConfig.showTimestamps,
        vscodeConfig.get<boolean>('showTimestamps', true)
      );
      assert.strictEqual(
        utilConfig.showRailsTables,
        vscodeConfig.get<boolean>('showRailsTables', true)
      );
    });
  });

  suite('Constants', () => {
    test('RAILS_INTERNAL_TABLES should be an array', () => {
      assert.ok(Array.isArray(RAILS_INTERNAL_TABLES));
      assert.ok(RAILS_INTERNAL_TABLES.length > 0);
    });

    test('RAILS_INTERNAL_TABLES should contain expected Rails tables', () => {
      assert.ok(RAILS_INTERNAL_TABLES.includes('action_text_rich_texts'));
      assert.ok(RAILS_INTERNAL_TABLES.includes('active_storage_attachments'));
      assert.ok(RAILS_INTERNAL_TABLES.includes('active_storage_blobs'));
      assert.ok(RAILS_INTERNAL_TABLES.includes('active_storage_variant_records'));
    });

    test('TIMESTAMP_COLUMNS should be an array', () => {
      assert.ok(Array.isArray(TIMESTAMP_COLUMNS));
      assert.ok(TIMESTAMP_COLUMNS.length > 0);
    });

    test('TIMESTAMP_COLUMNS should contain timestamp fields', () => {
      assert.ok(TIMESTAMP_COLUMNS.includes('created_at'));
      assert.ok(TIMESTAMP_COLUMNS.includes('updated_at'));
    });

    test('should have exactly 2 timestamp columns', () => {
      assert.strictEqual(TIMESTAMP_COLUMNS.length, 2);
    });

    test('should have exactly 4 Rails internal tables', () => {
      assert.strictEqual(RAILS_INTERNAL_TABLES.length, 4);
    });
  });

  suite('Configuration Section', () => {
    test('should access rails-schemas configuration section', () => {
      const config = vscode.workspace.getConfiguration('rails-schemas');
      assert.ok(config);
    });

    test('should have all configuration properties defined', () => {
      const config = vscode.workspace.getConfiguration('rails-schemas');

      assert.ok(config.has('autoReveal'));
      assert.ok(config.has('showIndexes'));
      assert.ok(config.has('showTimestamps'));
      assert.ok(config.has('showRailsTables'));
    });
  });

  suite('RailsSchemasConfig Interface', () => {
    test('should match RailsSchemasConfig interface structure', () => {
      const config = getConfig();

      // Verify all required properties exist with correct types
      const requiredProps = ['autoReveal', 'showIndexes', 'showTimestamps', 'showRailsTables'];

      requiredProps.forEach((prop) => {
        assert.ok(prop in config, `Property ${prop} should exist`);
        assert.strictEqual(
          typeof config[prop as keyof typeof config],
          'boolean',
          `Property ${prop} should be boolean`
        );
      });

      // Verify no extra properties
      const configKeys = Object.keys(config);
      assert.strictEqual(configKeys.length, requiredProps.length);
    });
  });
});
