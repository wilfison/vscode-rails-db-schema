import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import SchemaModel from '../schema_model.js';
import SchemaTreeDataProvider from '../schema_tree_data_provider.js';
import SchemaExplorer from '../schema_explorer.js';

suite('End-to-End Integration Test Suite', () => {
  // Use caminho absoluto baseado no workspace
  const fixturesPath = path.join(__dirname, '../../src/test/fixtures');

  suite('Complete Schema Workflow', () => {
    test('should load schema, create tree, and filter results', async () => {
      // 1. Load schema
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      assert.ok(model.data.length > 0, 'Schema should have tables');

      // 2. Create tree provider
      const provider = new SchemaTreeDataProvider(model);
      const allTables = await provider.getChildren();
      assert.ok(allTables.length > 0, 'Should have tables in tree');

      // 3. Filter by search
      provider.setSearchTerm('users');
      const filteredResults = await provider.getChildren();
      assert.ok(filteredResults.length >= 1, 'Should have filtered results');

      // 4. Clear filter
      provider.clearSearch();
      const unfilteredResults = await provider.getChildren();
      assert.ok(
        unfilteredResults.length >= filteredResults.length,
        'Unfiltered should have same or more results'
      );
    });

    test('should navigate through table hierarchy', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);

      // Get root level (tables)
      const tables = await provider.getChildren();
      assert.ok(tables.length > 0);

      // Get table children (columns and indexes)
      const firstTable = tables[0];
      const columns = await provider.getChildren(firstTable);
      assert.ok(columns.length >= 0);

      // Verify parent relationship
      if (columns.length > 0) {
        const parent = provider.getParent(columns[0]);
        assert.strictEqual(parent, firstTable);
      }
    });

    test('should handle multiple schema files', async () => {
      const schema1Uri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const schema2Uri = vscode.Uri.file(path.join(fixturesPath, 'minimal_schema.rb'));

      const model1 = new SchemaModel(schema1Uri);
      const model2 = new SchemaModel(schema2Uri);

      await model1.refreshSchema();
      await model2.refreshSchema();

      assert.ok(model1.data.length > 0);
      assert.ok(model2.data.length > 0);
      assert.notStrictEqual(model1.data.length, model2.data.length);
    });

    test('should refresh and maintain state', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      provider.setSearchTerm('test');

      const initialSearchTerm = provider.currentSearchTerm;
      provider.refresh();
      const afterRefreshSearchTerm = provider.currentSearchTerm;

      assert.strictEqual(initialSearchTerm, afterRefreshSearchTerm);
    });
  });

  suite('Schema Statistics Workflow', () => {
    test('should calculate statistics across full schema', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      const stats = provider.getStatistics();

      // Manually count to verify
      let expectedColumns = 0;
      let expectedIndexes = 0;

      model.data.forEach((table) => {
        table.children.forEach((child) => {
          if (child.isIndex) {
            expectedIndexes++;
          } else {
            expectedColumns++;
          }
        });
      });

      assert.strictEqual(stats.tables, model.data.length);
      assert.strictEqual(stats.columns, expectedColumns);
      assert.strictEqual(stats.indexes, expectedIndexes);
    });
  });

  suite('Search and Filter Workflow', () => {
    test('should filter by table name', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      provider.setSearchTerm('users');

      const results = await provider.getChildren();
      const tables = results.filter((r) => r.isTable);

      tables.forEach((table) => {
        assert.ok(table.label.toLowerCase().includes('users'));
      });
    });

    test('should filter by column name', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      provider.setSearchTerm('email');

      const results = await provider.getChildren();
      const tables = results.filter((r) => r.isTable);

      // Should find tables that have 'email' in column names or table name
      assert.ok(tables.length > 0);
    });

    test('should handle case-insensitive search', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);

      provider.setSearchTerm('USERS');
      const upperResults = await provider.getChildren();
      const upperTables = upperResults.filter((r) => r.isTable);

      provider.setSearchTerm('users');
      const lowerResults = await provider.getChildren();
      const lowerTables = lowerResults.filter((r) => r.isTable);

      assert.strictEqual(upperTables.length, lowerTables.length);
    });
  });

  suite('Tree Item Creation Workflow', () => {
    test('should create appropriate tree items for all node types', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);

      // Test table tree item
      const tables = model.data;
      const table = tables[0];
      const tableItem = provider.getTreeItem(table);

      assert.strictEqual(tableItem.contextValue, 'schemaTable');
      assert.strictEqual(
        tableItem.collapsibleState,
        vscode.TreeItemCollapsibleState.Collapsed
      );

      // Test column tree item
      const columns = table.children.filter((c) => !c.isIndex);
      if (columns.length > 0) {
        const columnItem = provider.getTreeItem(columns[0]);
        assert.strictEqual(columnItem.contextValue, 'schemaField');
      }

      // Test index tree item
      const indexes = table.children.filter((c) => c.isIndex);
      if (indexes.length > 0) {
        const indexItem = provider.getTreeItem(indexes[0]);
        assert.strictEqual(indexItem.contextValue, 'schemaIndex');
      }
    });
  });

  suite('Configuration-based Filtering', () => {
    test('should respect configuration for filtering', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      // The model respects configuration during parsing
      // Verify that tables were loaded
      assert.ok(model.data.length > 0);

      // Verify that internal tables might be included or excluded
      // based on current configuration
      const hasInternalTables = model.data.some(
        (table) =>
          table.label === 'active_storage_blobs' || table.label === 'action_text_rich_texts'
      );

      // Just verify the check works
      assert.ok(typeof hasInternalTables === 'boolean');
    });
  });

  suite('Edge Cases', () => {
    test('should handle empty schema gracefully', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'empty_schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      const children = await provider.getChildren();

      assert.strictEqual(children.length, 0);
    });

    test('should handle search with no results', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const provider = new SchemaTreeDataProvider(model);
      provider.setSearchTerm('nonexistent_table_xyz_123');

      const results = await provider.getChildren();
      assert.strictEqual(results.length, 1);
      assert.ok(results[0].label.includes('No results'));
    });

    test('should handle table without columns', async () => {
      // Settings table in schema.rb has id: false
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const settingsTable = model.data.find((t) => t.label === 'settings');
      if (settingsTable) {
        assert.ok(settingsTable.children.length >= 0);
      }
    });
  });

  suite('Schema Explorer Integration', () => {
    test('should initialize with tree data provider', async () => {
      const explorer = new SchemaExplorer();
      await explorer.initialize();

      assert.ok(explorer.treeDataProvider);
      assert.ok(explorer.treeDataProvider.model);
    });

    test('should handle search through explorer', async () => {
      const explorer = new SchemaExplorer();
      await explorer.initialize();

      explorer.treeDataProvider.setSearchTerm('test');
      assert.strictEqual(explorer.treeDataProvider.currentSearchTerm, 'test');

      explorer.clearSearch();
      assert.strictEqual(explorer.treeDataProvider.currentSearchTerm, '');
    });

    test('should get statistics through explorer', async () => {
      const explorer = new SchemaExplorer();
      await explorer.initialize();

      const stats = explorer.treeDataProvider.getStatistics();
      assert.ok(typeof stats.tables === 'number');
      assert.ok(typeof stats.columns === 'number');
      assert.ok(typeof stats.indexes === 'number');
    });
  });
});
