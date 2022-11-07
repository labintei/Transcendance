export class Message {
  sender: string;
  content: string;
  time: Date;

  constructor(_sender: string, _content: string, _time: Date) {
    this.sender = _sender;
    this.content = _content;
    this.time = _time;
  }
}