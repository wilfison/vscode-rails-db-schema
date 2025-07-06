import * as vscode from "vscode";
import SchemaNode from "./schema_node";

export default class SchemaModel {
  public data: SchemaNode[];
  public readonly uri: vscode.Uri;

  constructor(uri: vscode.Uri) {
    this.data = [];
    this.uri = uri;
  }

  public schemaFIleName(): string {
    return this.uri.fsPath.split("/").pop() || "schema.rb";
  }

  public async refreshSchema(): Promise<void> {
    this.data = [];

    await this.getRailsSchema();
  }

  public async getRailsSchema(): Promise<void> {
    if (this.uri.fsPath === "/") {
      return;
    }

    const document = await vscode.workspace.openTextDocument(this.uri);

    try {
      const schemaText = document.getText();
      const tablesRegex = /create_table([\s\S]*?)(  end)/g;
      const tablesRegexMatch = schemaText.match(tablesRegex);

      if (tablesRegexMatch === null || tablesRegexMatch.length === 0) {
        return;
      }

      const schemaNodes = this.getSchemaNodes(tablesRegexMatch);
      this.data = schemaNodes;
    } catch (_err) {
      vscode.window.showInformationMessage(`Error parsing schema file: ${this.schemaFIleName()}`);
    }
  }

  private getSchemaNodes(tablesRegexMatch: RegExpMatchArray): SchemaNode[] {
    const tableNameRegex = /(?<=create_table ")([\s\S]*?)(?=("))/g;
    const tableDefinitionRegex = /(?=create_table )([\s\S]*?)(do)/g;
    const commentsInfoRegex = /(?=comment: )([\s\S]*?)(?=(" do)|(",))/;

    return tablesRegexMatch.map((tableText) => {
      const tableLableMatch = tableText.match(tableNameRegex);
      const tableDefinitionMatch = tableText.match(tableDefinitionRegex);
      const commentsInfo = tableDefinitionMatch
        ? tableDefinitionMatch[0].match(commentsInfoRegex)
        : "";
      const children = this.getTableFields(tableText);
      const label = tableLableMatch ? tableLableMatch[0] : "";
      const tooltip = commentsInfo ? `${commentsInfo[0]}"` : "";
      return {
        label: label,
        type: null,
        tooltip: tooltip,
        isTable: true,
        children: children,
        parent: undefined,
        schemaUri: this.uri,
      };
    });
  }

  private getTableFields(tableText: string): SchemaNode[] {
    const fieldsRegex =
      /(?= t\.(?!index))([\s\S]*?)(?=\n)|(primary_key:[\s\S]*?)\sdo\s\|t\|(?=\n)/g;
    const fieldLabelRegex = /(?<=")([\s\S]*?)(?=("))/g;
    const typeLabelRegex = /(?<=t\.)([\s\S]*?)(?=( ))|(?<=id:\s:)([\s\S]*?)(?=[,\s])/g;
    const extraInfoRegex = /(?<=,)([\s\S]*?)(?=(, comment))/g;
    const commentsInfoRegex = /(?=comment: )([\s\S]*?)*("|')/;
    const fields = tableText.match(fieldsRegex) || [];

    return fields.map((fieldText) => {
      const fieldMatch = fieldText.match(fieldLabelRegex);
      const typeMatch = fieldText.match(typeLabelRegex);
      const extraInfo = fieldText.match(extraInfoRegex);
      const commentsInfo = fieldText.match(commentsInfoRegex);
      const label = fieldMatch ? fieldMatch[0] : "";
      const type = typeMatch ? typeMatch[0] : null;
      const description = extraInfo ? extraInfo[0] : "";
      const tooltip = commentsInfo ? commentsInfo[0] : "";
      const isPrimaryKey =
        (fieldMatch && fieldMatch[0] === "id") || fieldText.includes("primary_key:");

      return {
        label: label,
        type: type,
        description: description,
        tooltip: tooltip,
        isTable: false,
        isPrimaryKey: isPrimaryKey,
        children: [],
        parent: undefined,
      };
    });
  }
}
