import { Uri } from 'vscode';

export interface SchemaColumnAttributes {
  default?: string | number | boolean | null;
  null?: boolean;
  limit?: number;
  precision?: number;
  scale?: number;
}

interface SchemaNode {
  label: string;
  type: string | null;
  description?: string;
  tooltip?: string;
  schemaUri?: Uri;
  isTable: boolean;
  isPrimaryKey?: boolean;
  isIndex?: boolean;
  indexColumns?: string[];
  isUnique?: boolean;
  children: SchemaNode[];
  parent: SchemaNode | undefined;
  tableName: string;
  attributes?: string;
}

export default SchemaNode;
