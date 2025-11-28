export function rubyHashToJson(hashString: string): any | null {
  const jsonString = hashString
    .replace(/:(\w+)\s*=>/g, '"$1":') // Convert Ruby symbols to JSON keys
    .replace(/'/g, '"') // Replace single quotes with double quotes
    .replace(/(\w+):/g, '"$1":') // Convert Ruby 1.9+ symbol keys to JSON keys
    .replace(/:(\w+)/g, '"$1"') // Convert Ruby symbols to JSON strings
    .replace(/nil/g, "null") // Convert Ruby nil to JSON null
    .replace(/=>/g, ":") // Replace hash rockets with colons
    .replace(/( do \|\w+\|)/g, ""); // Remove block parameters

  try {
    return JSON.parse(jsonString);
  } catch {
    console.error("Failed to parse JSON string:", jsonString);
    return {};
  }
}
