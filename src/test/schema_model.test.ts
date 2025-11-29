import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import SchemaModel from '../schema_model.js';

suite('SchemaModel Test Suite', () => {
  // Use caminho absoluto baseado no workspace
  const fixturesPath = path.join(__dirname, '../../src/test/fixtures');

  suite('Schema Parsing', () => {
    test('should parse a basic schema file', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'minimal_schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      assert.strictEqual(model.data.length, 1);
      const usersTable = model.data[0];
      assert.strictEqual(usersTable.label, 'users');
      assert.strictEqual(usersTable.isTable, true);
    });

    test('should parse table with multiple columns', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);
      assert.ok(usersTable.children.length > 0);

      // Check for specific columns
      const emailColumn = usersTable.children.find((col) => col.label === 'email');
      assert.ok(emailColumn);
      assert.strictEqual(emailColumn.type, 'string');
    });

    test('should detect primary keys', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const idColumn = usersTable.children.find((col) => col.isPrimaryKey);
      assert.ok(idColumn);
      assert.strictEqual(idColumn.label, 'id');
    });

    test('should parse column attributes', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const emailColumn = usersTable.children.find((col) => col.label === 'email');
      assert.ok(emailColumn);
      assert.ok(emailColumn.description?.includes('Not Null'));
      assert.ok(emailColumn.description?.includes('limit: 255'));
    });

    test('should parse default values', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const nameColumn = usersTable.children.find((col) => col.label === 'name');
      assert.ok(nameColumn);
      assert.ok(nameColumn.description?.includes('default: Guest'));
    });

    test('should parse indexes', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const emailIndex = usersTable.children.find(
        (child) => child.isIndex && child.indexColumns?.includes('email')
      );
      assert.ok(emailIndex);
      assert.strictEqual(emailIndex.isUnique, true);
    });

    test('should parse composite indexes', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const postsTable = model.data.find((table) => table.label === 'posts');
      assert.ok(postsTable);

      const compositeIndex = postsTable.children.find(
        (child) => child.isIndex && child.indexColumns?.length === 2
      );
      assert.ok(compositeIndex);
      assert.ok(compositeIndex.indexColumns?.includes('status'));
      assert.ok(compositeIndex.indexColumns?.includes('published_at'));
    });

    test('should parse decimal precision and scale', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const productsTable = model.data.find((table) => table.label === 'products');
      assert.ok(productsTable);

      const priceColumn = productsTable.children.find((col) => col.label === 'price');
      assert.ok(priceColumn);
      assert.strictEqual(priceColumn.type, 'decimal');
      assert.strictEqual(priceColumn.attributes?.precision, 10);
      assert.strictEqual(priceColumn.attributes?.scale, 2);
    });

    test('should parse table with custom primary key', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const productsTable = model.data.find((table) => table.label === 'products');
      assert.ok(productsTable);

      const uuidColumn = productsTable.children.find((col) => col.isPrimaryKey);
      assert.ok(uuidColumn);
      assert.strictEqual(uuidColumn.label, 'uuid');
    });

    test('should parse table without primary key', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const settingsTable = model.data.find((table) => table.label === 'settings');
      assert.ok(settingsTable);

      const pkColumn = settingsTable.children.find((col) => col.isPrimaryKey);
      assert.strictEqual(pkColumn, undefined);
    });

    test('should parse table comments', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const postsTable = model.data.find((table) => table.label === 'posts');
      assert.ok(postsTable);
      assert.ok(postsTable.tooltip?.includes('Blog posts table'));
    });

    test('should handle empty schema', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'empty_schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      assert.strictEqual(model.data.length, 0);
    });

    test('should set parent references correctly', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      const emailColumn = usersTable.children.find((col) => col.label === 'email');
      assert.ok(emailColumn);
      assert.strictEqual(emailColumn.parent, usersTable);
      assert.strictEqual(emailColumn.tableName, 'users');
    });

    test('should get schema file name', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);

      const fileName = model.schemaFIleName();
      assert.strictEqual(fileName, 'schema.rb');
    });

    test('should filter Rails internal tables when configured', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      // With default config (showRailsTables: true), Rails tables should be included
      const activeStorageTable = model.data.find(
        (table) => table.label === 'active_storage_blobs'
      );
      const actionTextTable = model.data.find((table) => table.label === 'action_text_rich_texts');

      // These tables exist in schema.rb fixture
      assert.ok(activeStorageTable || actionTextTable);
    });

    test('should filter timestamp columns when configured', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);
      await model.refreshSchema();

      const usersTable = model.data.find((table) => table.label === 'users');
      assert.ok(usersTable);

      // With default config (showTimestamps: true), timestamps should be included
      const createdAt = usersTable.children.find((col) => col.label === 'created_at');
      const updatedAt = usersTable.children.find((col) => col.label === 'updated_at');

      assert.ok(createdAt);
      assert.ok(updatedAt);
    });
  });

  suite('Schema URI Management', () => {
    test('should store schema URI', async () => {
      const schemaUri = vscode.Uri.file(path.join(fixturesPath, 'schema.rb'));
      const model = new SchemaModel(schemaUri);

      assert.strictEqual(model.uri.fsPath, schemaUri.fsPath);
    });

    test('should handle root path gracefully', async () => {
      const rootUri = vscode.Uri.parse('/');
      const model = new SchemaModel(rootUri);
      await model.refreshSchema();

      assert.strictEqual(model.data.length, 0);
    });
  });
});
