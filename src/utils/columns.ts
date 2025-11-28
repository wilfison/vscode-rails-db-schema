import { SchemaColumnAttributes } from '../schema_node';

const PRECISION_ATTRS = ['precision', 'scale'];

const COLUMN_RELEVANT_ATTRIBUTES = {
  string: ['limit', 'default'],
  text: ['limit'],
  integer: ['limit', 'default'],
  decimal: ['precision', 'scale', 'default'],
  float: ['default'],
  boolean: ['default'],
};

const MAP_COLUMN_TYPE_TO_ATTRIBUTES: { [key: string]: string[] } = {
  string: COLUMN_RELEVANT_ATTRIBUTES.string,
  text: COLUMN_RELEVANT_ATTRIBUTES.text,
  text_basic: COLUMN_RELEVANT_ATTRIBUTES.text,
  integer: COLUMN_RELEVANT_ATTRIBUTES.integer,
  int: COLUMN_RELEVANT_ATTRIBUTES.integer,
  bigint: COLUMN_RELEVANT_ATTRIBUTES.integer,
  decimal: COLUMN_RELEVANT_ATTRIBUTES.decimal,
  float: COLUMN_RELEVANT_ATTRIBUTES.float,
  double: COLUMN_RELEVANT_ATTRIBUTES.float,
  boolean: COLUMN_RELEVANT_ATTRIBUTES.boolean,
  bool: COLUMN_RELEVANT_ATTRIBUTES.boolean,
};

function parsePrecisionScale(precision: number | undefined, scale: number | undefined): string {
  if (precision !== undefined && scale !== undefined) {
    return `${precision - scale}.${scale}`;
  }

  return '';
}

export function filterColumnAttributes(
  columnType: string,
  attributes: SchemaColumnAttributes
): string {
  const relevantAttributes = MAP_COLUMN_TYPE_TO_ATTRIBUTES[columnType];
  if (!relevantAttributes) {
    if (attributes.null === false) {
      return 'Not Null';
    }

    return '';
  }

  const filteredAttributes: string[] = [];

  if (PRECISION_ATTRS.every((attr) => relevantAttributes.includes(attr))) {
    filteredAttributes.push(parsePrecisionScale(attributes.precision, attributes.scale));
  }

  if (relevantAttributes.includes('limit') && attributes.limit !== undefined) {
    filteredAttributes.push(`limit: ${attributes.limit}`);
  }

  if (relevantAttributes.includes('default') && attributes.default !== undefined) {
    filteredAttributes.push(`default: ${attributes.default}`);
  }

  if (attributes.null === false) {
    filteredAttributes.push('Not Null');
  }

  return filteredAttributes.join(', ');
}
