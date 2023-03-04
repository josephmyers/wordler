import Letter from "./Letter";

export default class Word {
  constructor(letters) {
    this.letters = [new Letter(), new Letter(), new Letter(), new Letter(), new Letter()];
    for (let i = 0; i < 5 && i < letters.length; i++)
    {
      this.letters[i] = letters[i];
    }
  }

  static createEmpty() {
    return [new Letter(), new Letter(), new Letter(), new Letter(), new Letter()];
  }
}