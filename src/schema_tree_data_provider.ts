import * as vscode from "vscode";

import SchemaModel from "./schema_model";
import SchemaNode from "./schema_node";

const ICONS = {
  table: new vscode.ThemeIcon("table"),
  field: new vscode.ThemeIcon("layout-centered"),
  primaryKey: new vscode.ThemeIcon("key", new vscode.ThemeColor("list.warningForeground")),
};

export default class SchemaTreeDataProvider implements vscode.TreeDataProvider<SchemaNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<SchemaNode | undefined | null | void> =
    new vscode.EventEmitter<SchemaNode | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<SchemaNode | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private searchTerm: string = "";

  constructor(public model: SchemaModel) {}

  public refresh(): any {
    this.model.refreshSchema();
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: SchemaNode): vscode.TreeItem {
    return {
      label: element.type ? `${element.label} (${element.type})` : element.label,
      description: element.description,
      tooltip: element.tooltip,
      contextValue: element.isTable ? "schemaTable" : "schemaField",
      collapsibleState: element.isTable ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
      iconPath: this.getIconForNode(element),
    };
  }

  public getChildren(element?: SchemaNode): SchemaNode[] | Thenable<SchemaNode[]> {
    if (element) {
      return element.children;
    }

    if (this.searchTerm) {
      return this.getFilteredTables();
    }

    return this.model.data;
  }

  public setSearchTerm(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    this._onDidChangeTreeData.fire();
  }

  public clearSearch(): void {
    this.searchTerm = "";
    this._onDidChangeTreeData.fire();
  }

  private getFilteredTables(): SchemaNode[] {
    return this.model.data.filter((table) => {
      if (table.label.toLowerCase().includes(this.searchTerm)) {
        return true;
      }

      return table.children.some((column) => column.label.toLowerCase().includes(this.searchTerm));
    });
  }

  public getParent(element: SchemaNode): SchemaNode | undefined {
    return element.parent;
  }

  private getIconForNode(node: SchemaNode): vscode.ThemeIcon {
    if (node.isTable) {
      return ICONS.table;
    } else if (node.isPrimaryKey) {
      return ICONS.primaryKey;
    } else {
      return ICONS.field;
    }
  }
}
