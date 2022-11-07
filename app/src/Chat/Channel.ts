export enum ChannelStatus {
  DIRECT = "Direct",
  PUBLIC = "Public",
  PRIVATE = "Private"
}

export class Channel {
  id: number;
  status: ChannelStatus;
  name: string;

  constructor(_id: number, _status: ChannelStatus, _name: string) {
    this.id = _id;
    this.status = _status;
    this.name = _name;
  }
}