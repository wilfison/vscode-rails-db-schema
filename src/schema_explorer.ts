import * as vscode from "vscode";

import SchemaNode from "./schema_node";
import SchemaModel from "./schema_model";
import SchemaTreeDataProvider from "./schema_tree_data_provider";

import { getCurrentTableName, getSchemaUris, lookForCustomTableName } from "./file_utils";

class SchemaExplorer {
  public treeDataProvider: SchemaTreeDataProvider;

  private schemaViewer: vscode.TreeView<SchemaNode>;
  private schemaModels: SchemaModel[];
  private currentSchemaModel: SchemaModel;

  constructor() {
    this.schemaModels = [];
    this.currentSchemaModel = new SchemaModel(vscode.Uri.parse("/"));

    this.treeDataProvider = new SchemaTreeDataProvider(this.currentSchemaModel);

    this.schemaViewer = vscode.window.createTreeView("RailsDbSchema", {
      treeDataProvider: this.treeDataProvider,
    });
  }

  public async initialize(): Promise<void> {
    this.schemaModels = await this.createSchemaModels();

    this.currentSchemaModel = this.schemaModels[0];
    this.treeDataProvider.model = this.currentSchemaModel;

    this.reveal();
  }

  public async reveal(): Promise<void> {
    await this.currentSchemaModel.refreshSchema();

    const currentTable = getCurrentTableName();
    let node = this.getNode(currentTable);
    if (node) {
      this.schemaViewer.reveal(node, {
        expand: true,
        select: true,
        focus: true,
      });
    } else {
      lookForCustomTableName((customTableName: string | null) => {
        node = this.getNode(customTableName);
        if (node) {
          this.schemaViewer.reveal(node, {
            expand: true,
            select: true,
            focus: true,
          });
        } else {
          const schemaNodes = this.currentSchemaModel.data;
          this.schemaViewer.reveal(schemaNodes[0], {
            expand: false,
            select: true,
            focus: true,
          });
        }
      });
    }
  }

  private async createSchemaModels(): Promise<SchemaModel[]> {
    const schemaUris = await getSchemaUris();

    return schemaUris.map((uri) => {
      return new SchemaModel(uri);
    });
  }

  public async openInSchema(document: vscode.TextDocument, node: SchemaNode): Promise<void> {
    const lineCount = document.lineCount;
    let tableLine = 0;

    for (let index = 0; index < lineCount; index++) {
      const schemaTextLine = document.lineAt(index);
      if (schemaTextLine.text.trimStart().startsWith(`create_table "${node.label}"`)) {
        tableLine = index;
      }
    }

    const editor = await vscode.window.showTextDocument(document.uri);
    const position = new vscode.Position(tableLine, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
  }

  private getNode(label: string | null): SchemaNode | undefined {
    const schemaNodes = this.currentSchemaModel.data;

    if (schemaNodes.length === 0) {
      return undefined;
    }

    return schemaNodes.find((node) => {
      if (node.label === label) {
        return node;
      }
    });
  }
}

export default SchemaExplorer;
