import { XMLParser, XMLBuilder } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
})

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  format: true,
  indentBy: '    ',
})

export function parseXmlResponse(xml: string): Record<string, unknown> {
  const result = parser.parse(xml)
  return result?.envelope?.body || {}
}

export function buildXmlRequest(
  username: string,
  password: string,
  command: string,
  content: Record<string, unknown> = {}
): string {
  const envelope: Record<string, unknown> = {
    envelope: {
      header: {
        security: 'username',
        username,
        password,
      },
      body: {
        command,
        content,
      },
    },
  }
  return '<?xml version="1.0" encoding="utf-8"?>\n' + builder.build(envelope)
}

export function extractError(xmlOrJson: Record<string, unknown>): number {
  return (xmlOrJson.error as number) ?? -1
}
