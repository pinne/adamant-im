/* eslint-disable */
const zones = ['com', 'org', 'ru', 'net', 'de', 'br', 'uk', 'it', 'pl', 'jp', 'fr', 'au', 'ir', 'in', 'info']

const inline = {
  text: /^[^\n]+/, // not implemented
  email: /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/g,
  link: /((eth|bch|bitcoin|https?|s?ftp|magnet|tor|onion|tg):([^\s\x00-\x1f<>]+[^\s\x00-\x1f<>.]))/g,
  autolink: /([^\s\x00-\x1f<>]+.(zones))/g, // not implemented
  bold: /([\s]+|^)\*([^\s][^\n]+[^\s])\*/g,
  italic: /([\s]+|^)_([^\s][^\n]+[^\s])_/g,
  strike: /([\s]+|^)~([^\s][^\n]+[^\s])~/g,
  code: /([\s]+|^)`([^\s][^\n]+[^\s])`/g,
  br: /\n/g
}

const block = {
  paragraph: /^([^\n]+(\n[^\n]+)*)/,
  pre: /^```([^`]+)```/,
  quote: /^> (.*)/,
  newline: /^\n+/
}

export { inline, block }
