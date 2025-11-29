import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import SchemaExplorer from '../schema_explorer.js';

suite('SchemaExplorer Integration Test Suite', () => {
  let schemaExplorer: SchemaExplorer;

  setup(async () => {
    schemaExplorer = new SchemaExplorer();
    await schemaExplorer.initialize();
  });

  suite('Initialization', () => {
    test('should initialize schema explorer', () => {
      assert.ok(schemaExplorer);
      assert.ok(schemaExplorer.treeDataProvider);
    });

    test('should have a tree data provider', () => {
      assert.ok(schemaExplorer.treeDataProvider);
      assert.ok(schemaExplorer.treeDataProvider.model);
    });
  });

  suite('Search Functionality', () => {
    test('should set search term on tree data provider', async () => {
      const provider = schemaExplorer.treeDataProvider;
      provider.setSearchTerm('users');

      assert.strictEqual(provider.currentSearchTerm, 'users');
      assert.strictEqual(provider.isFiltered, true);
    });

    test('should clear search term', async () => {
      const provider = schemaExplorer.treeDataProvider;
      provider.setSearchTerm('users');
      schemaExplorer.clearSearch();

      assert.strictEqual(provider.currentSearchTerm, '');
      assert.strictEqual(provider.isFiltered, false);
    });
  });

  suite('Statistics', () => {
    test('should show statistics', () => {
      // This would normally show a message box
      // Just verify the method exists and can be called
      assert.ok(typeof schemaExplorer.showStatistics === 'function');
    });

    test('should calculate statistics correctly', () => {
      const stats = schemaExplorer.treeDataProvider.getStatistics();

      assert.ok(typeof stats.tables === 'number');
      assert.ok(typeof stats.columns === 'number');
      assert.ok(typeof stats.indexes === 'number');
    });
  });

  suite('Copy Operations', () => {
    test('should have copyReference method', () => {
      assert.ok(typeof schemaExplorer.copyReference === 'function');
    });

    test('should have copyColumnNames method', () => {
      assert.ok(typeof schemaExplorer.copyColumnNames === 'function');
    });
  });

  suite('View Visibility', () => {
    test('should check view visibility', () => {
      const isVisible = schemaExplorer.isViewVisible();
      assert.ok(typeof isVisible === 'boolean');
    });
  });

  suite('Schema Selection', () => {
    test('should have selectSchema method', () => {
      assert.ok(typeof schemaExplorer.selectSchema === 'function');
    });
  });

  suite('Open in Schema', () => {
    test('should have openInSchema method', () => {
      assert.ok(typeof schemaExplorer.openInSchema === 'function');
    });
  });

  suite('Reveal Tables', () => {
    test('should have revealTables method', () => {
      assert.ok(typeof schemaExplorer.revealTables === 'function');
    });

    test('should have reveal method', () => {
      assert.ok(typeof schemaExplorer.reveal === 'function');
    });
  });
});
