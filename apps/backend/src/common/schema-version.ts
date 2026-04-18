const CURRENT_SCHEMA_VERSION = '1.0.0';

export function normalizeSchemaContent(content: unknown): Record<string, any> {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { schemaVersion: CURRENT_SCHEMA_VERSION };
  }

  const record = content as Record<string, any>;
  return {
    ...record,
    schemaVersion:
      typeof record.schemaVersion === 'string'
        ? record.schemaVersion
        : CURRENT_SCHEMA_VERSION,
  };
}
