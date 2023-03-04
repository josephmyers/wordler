import LetterStatus from "./LetterStatus";

export default class Letter {
  constructor() {
    this.letter = "";
    this.status = LetterStatus().NotPresent;
  }
}
