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
    return element ? element.children : this.model.data;
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
