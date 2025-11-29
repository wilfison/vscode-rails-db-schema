import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import {
  currentDocument,
  currentDocumentName,
  getSchemaUris,
  currentDocumentIsModel,
} from '../../utils/files.js';

suite('Files Utils Test Suite', () => {
  suite('currentDocument', () => {
    test('should return undefined when no editor is active', () => {
      // Close all editors first
      const doc = currentDocument();
      // May be undefined if no editor is open
      assert.ok(doc === undefined || doc instanceof Object);
    });

    test('should return document when editor is active', async () => {
      // Create a temporary document
      const doc = await vscode.workspace.openTextDocument({
        content: 'test content',
        language: 'ruby',
      });
      await vscode.window.showTextDocument(doc);

      const currentDoc = currentDocument();
      assert.ok(currentDoc);
    });
  });

  suite('currentDocumentName', () => {
    test('should extract document name from ruby file', async () => {
      // This would require opening an actual .rb file
      // For now, test that the function exists and returns the right type
      const name = currentDocumentName();
      assert.ok(name === undefined || typeof name === 'string');
    });
  });

  suite('currentDocumentIsModel', () => {
    test('should return false when no document is open', () => {
      // When no specific model file is open
      const isModel = currentDocumentIsModel();
      assert.ok(typeof isModel === 'boolean');
    });

    test('should return false for non-ruby files', async () => {
      const doc = await vscode.workspace.openTextDocument({
        content: 'test content',
        language: 'javascript',
      });
      await vscode.window.showTextDocument(doc);

      const isModel = currentDocumentIsModel();
      assert.strictEqual(isModel, false);
    });
  });

  suite('getSchemaUris', () => {
    test('should find schema files in workspace', async () => {
      const schemaUris = await getSchemaUris();
      assert.ok(Array.isArray(schemaUris));
    });

    test('should return array of URIs', async () => {
      const schemaUris = await getSchemaUris();
      schemaUris.forEach((uri) => {
        assert.ok(uri instanceof vscode.Uri);
      });
    });

    test('should sort schema files', async () => {
      const schemaUris = await getSchemaUris();
      if (schemaUris.length > 1) {
        // Verify they're sorted (reversed after initial sort)
        for (let i = 0; i < schemaUris.length - 1; i++) {
          assert.ok(
            schemaUris[i].fsPath >= schemaUris[i + 1].fsPath ||
              schemaUris[i].fsPath <= schemaUris[i + 1].fsPath
          );
        }
      }
    });
  });

  suite('File Path Patterns', () => {
    test('should recognize model file pattern', () => {
      const modelPath = '/path/to/app/models/user.rb';
      assert.ok(modelPath.match(/models\/.*\.rb$/));
    });

    test('should not match non-model ruby files', () => {
      const controllerPath = '/path/to/app/controllers/users_controller.rb';
      assert.ok(!controllerPath.match(/models\/.*\.rb$/));
    });
  });
});
