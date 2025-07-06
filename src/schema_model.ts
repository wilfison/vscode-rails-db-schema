import * as vscode from "vscode";
import SchemaNode from "./schema_node";

import { getSchemaUri } from "./file_utils";

export default class SchemaModel {
  data: SchemaNode[];
  callback: Function;

  constructor(callback: Function) {
    this.data = [];
    this.callback = callback;
    this.getRailsSchema();
  }

  public refreshSchema(): void {
    this.getRailsSchema();
  }

  public getRailsSchema(): void {
    const uri = getSchemaUri();

    if (uri === undefined) {
      return;
    }

    vscode.workspace.openTextDocument(uri).then(
      (document) => {
        const schemaText = document.getText();

        const tablesRegex = /create_table([\s\S]*?)(  end)/g;
        const tableNameRegex = /(?<=create_table ")([\s\S]*?)(?=("))/g;
        const tableDefinitionRegex = /(?=create_table )([\s\S]*?)(do)/g;
        const commentsInfoRegex = /(?=comment: )([\s\S]*?)(?=(" do)|(",))/;

        const tablesRegexMatch = schemaText.match(tablesRegex);
        if (tablesRegexMatch === null || tablesRegexMatch.length === 0) {
          return;
        }

        const schemaNodes = tablesRegexMatch.map((tableText) => {
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
          };
        });

        this.data = schemaNodes;
        this.callback();
      },
      (_err) =>
        vscode.window.showInformationMessage("Cannot find db/schema.rb file in the workspace")
    );
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
