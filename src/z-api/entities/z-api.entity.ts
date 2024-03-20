export type Text = {
  message: string;
};

export type Status = 'SENT' | 'RECEIVED' | 'READ' | 'READ-SELF' | 'PLAYED';

export type Audio = {
  ptt: boolean;
  seconds: number;
  audioUrl: string;
  mimeType: string;
  viewOnce: boolean;
};

export type ReceivedCallback = {
  isStatusReply: boolean;
  senderLid: string;
  connectedPhone: string;
  waitingMessage: boolean;
  isEdit: boolean;
  isGroup: boolean;
  isNewsletter: boolean;
  instanceId: string;
  messageId: string;
  phone: string;
  fromMe: boolean;
  momment: number;
  status: Status;
  chatName: string;
  senderPhoto: string;
  senderName: string;
  participantPhone: string | null;
  participantLid: string | null;
  photo: string;
  broadcast: boolean;
  type: 'ReceivedCallback';
  text?: Text;
  audio?: Audio;
  video?: any;
  document?: any;
  reaction?: any;
};

export type DeliveryCallback = {
  phone: string; // The phone number of the recipient
  zaapId: string;
  messageId: string;
  type: 'DeliveryCallback';
  instanceId: string;
};
