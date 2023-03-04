import dictionaryRaw from './dictionary.txt'

let dictionary;

(async () => {
  const response = await fetch(dictionaryRaw);
  const responseText = await response.text();
  dictionary = responseText.split(/\r\n|\r|\n/);
}
)();

export default function Dictionary() {
  return dictionary;
}