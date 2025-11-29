import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import SchemaTreeDataProvider from '../schema_tree_data_provider.js';
import SchemaModel from '../schema_model.js';
import SchemaNode from '../schema_node.js';

suite('SchemaTreeDataProvider Test Suite', () => {
  // Use caminho absoluto baseado no workspace
  const fixturesPath = path.join(__dirname, '../../src/test/fixtures');
  let schemaUri: vscode.Uri;
  let model: SchemaModel;
  let provider: SchemaTreeDataProvider;

  setup(async () => {
    schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
    model = new SchemaModel(schemaUri);
    await model.refreshSchema();
    provider = new SchemaTreeDataProvider(model);
  });

  suite('Tree Data Provider', () => {
    test('should provide tree items for root level', async () => {
      const children = await provider.getChildren();
      assert.ok(Array.isArray(children));
      assert.ok(children.length > 0);
    });

    test('should provide children for table nodes', async () => {
      const tables = await provider.getChildren();
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const columns = await provider.getChildren(usersTable);
      assert.ok(Array.isArray(columns));
      assert.ok(columns.length > 0);
    });

    test('should create tree items with correct properties', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const treeItem = provider.getTreeItem(usersTable);
      assert.strictEqual(treeItem.label, 'users');
      assert.strictEqual(treeItem.contextValue, 'schemaTable');
      assert.strictEqual(
        treeItem.collapsibleState,
        vscode.TreeItemCollapsibleState.Collapsed
      );
    });

    test('should set correct context values for different node types', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      // Table context
      const tableItem = provider.getTreeItem(usersTable);
      assert.strictEqual(tableItem.contextValue, 'schemaTable');

      // Field context
      const emailColumn = usersTable.children.find((col) => col.label === 'email');
      assert.ok(emailColumn);
      const fieldItem = provider.getTreeItem(emailColumn);
      assert.strictEqual(fieldItem.contextValue, 'schemaField');

      // Index context
      const emailIndex = usersTable.children.find((child) => child.isIndex);
      if (emailIndex) {
        const indexItem = provider.getTreeItem(emailIndex);
        assert.strictEqual(indexItem.contextValue, 'schemaIndex');
      }
    });

    test('should get parent of a node', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const emailColumn = usersTable.children.find((col) => col.label === 'email');
      assert.ok(emailColumn);

      const parent = provider.getParent(emailColumn);
      assert.strictEqual(parent, usersTable);
    });
  });

  suite('Search and Filter', () => {
    test('should filter tables by search term', async () => {
      provider.setSearchTerm('users');
      const children = await provider.getChildren();

      // Should have search summary + filtered tables
      assert.ok(children.length >= 1);

      // Find actual table nodes (skip search summary)
      const tables = children.filter((child) => child.isTable);
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);
    });

    test('should filter by column name', async () => {
      provider.setSearchTerm('email');
      const children = await provider.getChildren();

      // Should include tables that have 'email' column
      const tables = children.filter((child) => child.isTable);
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);
    });

    test('should show search summary when filtered', async () => {
      provider.setSearchTerm('users');
      const children = await provider.getChildren();

      const summaryNode = children.find((child) => child.label.includes('result(s) for'));
      assert.ok(summaryNode);
    });

    test('should show no results message when no matches', async () => {
      provider.setSearchTerm('nonexistent_table_xyz');
      const children = await provider.getChildren();

      assert.strictEqual(children.length, 1);
      assert.ok(children[0].label.includes('No results for'));
    });

    test('should clear search filter', async () => {
      provider.setSearchTerm('users');
      assert.strictEqual(provider.isFiltered, true);
      assert.strictEqual(provider.currentSearchTerm, 'users');

      provider.clearSearch();
      assert.strictEqual(provider.isFiltered, false);
      assert.strictEqual(provider.currentSearchTerm, '');

      const children = await provider.getChildren();
      // Should show all tables without search summary
      assert.ok(children.length > 1);
      assert.ok(!children.some((child) => child.label.includes('result(s) for')));
    });

    test('should be case-insensitive in search', async () => {
      provider.setSearchTerm('USERS');
      const children = await provider.getChildren();

      const tables = children.filter((child) => child.isTable);
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);
    });

    test('should filter by index column names', async () => {
      provider.setSearchTerm('email');
      const children = await provider.getChildren();

      // Should include tables that have indexes on 'email' column
      const tables = children.filter((child) => child.isTable);
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);
    });
  });

  suite('Statistics', () => {
    test('should calculate schema statistics', () => {
      const stats = provider.getStatistics();

      assert.ok(stats.tables > 0);
      assert.ok(stats.columns > 0);
      assert.ok(stats.indexes >= 0);
    });

    test('should count tables correctly', () => {
      const stats = provider.getStatistics();
      const expectedTables = model.data.length;

      assert.strictEqual(stats.tables, expectedTables);
    });

    test('should distinguish between columns and indexes', () => {
      const stats = provider.getStatistics();

      // Should have both columns and indexes
      assert.ok(stats.columns > 0);
      assert.ok(stats.indexes >= 0);

      // Total children should equal columns + indexes
      let totalChildren = 0;
      model.data.forEach((table) => {
        totalChildren += table.children.length;
      });

      assert.strictEqual(stats.columns + stats.indexes, totalChildren);
    });
  });

  suite('Tree Item Icons', () => {
    test('should use correct icon for table nodes', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const treeItem = provider.getTreeItem(usersTable);
      assert.ok(treeItem.iconPath);
      assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
    });

    test('should use correct icon for primary key', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const idColumn = usersTable.children.find((col) => col.isPrimaryKey);
      assert.ok(idColumn);

      const treeItem = provider.getTreeItem(idColumn);
      assert.ok(treeItem.iconPath);
      assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
    });

    test('should use correct icon for index nodes', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const indexNode = usersTable.children.find((child) => child.isIndex);
      if (indexNode) {
        const treeItem = provider.getTreeItem(indexNode);
        assert.ok(treeItem.iconPath);
        assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
      }
    });

    test('should differentiate unique and non-unique index icons', () => {
      const tables = model.data;
      const usersTable = tables.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const uniqueIndex = usersTable.children.find((child) => child.isIndex && child.isUnique);
      const regularIndex = usersTable.children.find(
        (child) => child.isIndex && !child.isUnique
      );

      if (uniqueIndex && regularIndex) {
        const uniqueItem = provider.getTreeItem(uniqueIndex);
        const regularItem = provider.getTreeItem(regularIndex);

        assert.ok(uniqueItem.iconPath instanceof vscode.ThemeIcon);
        assert.ok(regularItem.iconPath instanceof vscode.ThemeIcon);
        // Icons should be different for unique vs regular indexes
        assert.notStrictEqual(
          (uniqueItem.iconPath as vscode.ThemeIcon).id,
          (regularItem.iconPath as vscode.ThemeIcon).id
        );
      }
    });
  });

  suite('Refresh', () => {
    test('should refresh tree data', async () => {
      let refreshFired = false;
      provider.onDidChangeTreeData(() => {
        refreshFired = true;
      });

      provider.refresh();
      assert.strictEqual(refreshFired, true);
    });

    test('should reload schema data on refresh', async () => {
      const initialCount = model.data.length;
      
      // Refresh triggers model.refreshSchema() which is async
      // We need to wait for it to complete
      await model.refreshSchema();
      const afterRefreshCount = model.data.length;

      // Count should remain the same as schema file hasn't changed
      assert.strictEqual(initialCount, afterRefreshCount);
    });
  });

  suite('Search Info Nodes', () => {
    test('should create search info nodes with special styling', () => {
      provider.setSearchTerm('test');
      const children = provider.getChildren() as SchemaNode[];

      const summaryNode = children.find((child) => child.label.includes('result(s) for'));
      if (summaryNode) {
        const treeItem = provider.getTreeItem(summaryNode);
        assert.strictEqual(treeItem.contextValue, 'searchInfo');
        assert.strictEqual(treeItem.collapsibleState, vscode.TreeItemCollapsibleState.None);
      }
    });

    test('should show warning icon for no results', async () => {
      provider.setSearchTerm('nonexistent_xyz');
      const children = (await provider.getChildren()) as SchemaNode[];

      const noResultsNode = children.find((child) => child.label.includes('No results'));
      assert.ok(noResultsNode);

      const treeItem = provider.getTreeItem(noResultsNode);
      assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
      assert.strictEqual((treeItem.iconPath as vscode.ThemeIcon).id, 'warning');
    });

    test('should show search icon for results summary', async () => {
      provider.setSearchTerm('users');
      const children = (await provider.getChildren()) as SchemaNode[];

      const summaryNode = children.find((child) => child.label.includes('result(s) for'));
      if (summaryNode) {
        const treeItem = provider.getTreeItem(summaryNode);
        assert.ok(treeItem.iconPath instanceof vscode.ThemeIcon);
        assert.strictEqual((treeItem.iconPath as vscode.ThemeIcon).id, 'search');
      }
    });
  });
});
