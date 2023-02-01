interface IChannel {
  id: number;
  status: string;
  password: string;
  name: string;
  users: IChannelUser[];
  messages: IMessage[];
}

interface IChannelUser {
  channelId: number;
  userLogin: string;
  rights: string | null;
  status: string | null;
  rightsEnd: Date;
  user: IUser;
}

interface IMessage {
  time: Date;
  content: string;
  channelId: number;
  sender: IUser;
}

interface IUser {
  ft_login: string;
  username: string;
  status: string;
  avatarURL: string;
  level: number;
  xp: number;
  victories: number;
  defeats: number;
  draws: number;
  rank: number;
  relationships: IUserRelationship[];
  relatedships: IUserRelationship[];
}

interface IUserRelationship {
  owner: IUser;
  related: IUser;
  status: string;
}

export type {
  IChannel,
  IChannelUser,
  IMessage,
  IUser,
  IUserRelationship
}