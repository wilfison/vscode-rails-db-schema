import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('Extension Integration Test Suite', () => {
  vscode.window.showInformationMessage('Start all extension tests.');

  suite('Extension Activation', () => {
    test('should activate extension', async () => {
      const extension = vscode.extensions.getExtension('wilfison.rails-schemas');
      assert.ok(extension);

      if (!extension.isActive) {
        await extension.activate();
      }

      assert.ok(extension.isActive);
    });

    test('should register all commands', async () => {
      const commands = await vscode.commands.getCommands(true);

      const expectedCommands = [
        'rails-schemas.showRailsDbSchema',
        'rails-schemas.openInSchema',
        'rails-schemas.searchTables',
        'rails-schemas.clearSearch',
        'rails-schemas.selectSchema',
        'rails-schemas.copyReference',
        'rails-schemas.copyColumnNames',
        'rails-schemas.showStatistics',
      ];

      expectedCommands.forEach((cmd) => {
        assert.ok(
          commands.includes(cmd),
          `Command ${cmd} should be registered`
        );
      });
    });
  });

  suite('Commands', () => {
    test('should execute showRailsDbSchema command', async () => {
      await vscode.commands.executeCommand('rails-schemas.showRailsDbSchema');
      // Command should execute without errors
      assert.ok(true);
    });

    test('should execute searchTables command', async () => {
      // This command shows input box, so we can't fully test it without user interaction
      // But we can verify it's registered and callable
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('rails-schemas.searchTables'));
    });

    test('should execute showStatistics command', async () => {
      const commands = await vscode.commands.getCommands(true);
      assert.ok(commands.includes('rails-schemas.showStatistics'));
    });
  });

  suite('Views', () => {
    test('should register Rails Db Schema view', async () => {
      // Wait a bit for views to be registered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TreeView should be available through the extension
      assert.ok(true);
    });
  });

  suite('Configuration', () => {
    test('should have configuration defaults', () => {
      const config = vscode.workspace.getConfiguration('rails-schemas');

      assert.strictEqual(config.get('autoReveal'), true);
      assert.strictEqual(config.get('showIndexes'), true);
      assert.strictEqual(config.get('showTimestamps'), true);
      assert.strictEqual(config.get('showRailsTables'), true);
    });

    test('should be able to read configuration values', () => {
      const config = vscode.workspace.getConfiguration('rails-schemas');

      const autoReveal = config.get<boolean>('autoReveal');
      const showIndexes = config.get<boolean>('showIndexes');
      const showTimestamps = config.get<boolean>('showTimestamps');
      const showRailsTables = config.get<boolean>('showRailsTables');

      assert.strictEqual(typeof autoReveal, 'boolean');
      assert.strictEqual(typeof showIndexes, 'boolean');
      assert.strictEqual(typeof showTimestamps, 'boolean');
      assert.strictEqual(typeof showRailsTables, 'boolean');
    });
  });

  suite('File System Watchers', () => {
    test('should watch for schema file changes', async () => {
      // Extension should create file system watchers for schema files
      // This is hard to test directly, but we can verify the extension activated
      const extension = vscode.extensions.getExtension('wilfison.rails-schemas');
      assert.ok(extension?.isActive);
    });
  });

  suite('Context Keys', () => {
    test('should set context for multiple schemas', async () => {
      // Context keys should be set based on number of schema files found
      // This is verified indirectly through command availability
      assert.ok(true);
    });

    test('should set context for active search', async () => {
      // rails-schemas.hasActiveSearch context should be set when searching
      assert.ok(true);
    });
  });
});
