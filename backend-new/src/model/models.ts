// unknown, make sure to validate before use
import type { AccountId, TopicId } from "@hashgraph/sdk";
import { Document} from "mongoose";


type EventType =  "CREATE" | "EDIT_PHONE" | "EDIT_INFO" | "EDIT_PIN" | "TRANSFER" | "TRANSFORMATION" | "REGISTER_CREATOR" | "REGISTER" | "CREATE" | "TRANSFER" | "TRANSFORM" | "CONNECT" | "VERIFY" | "REVOKE" | "ADD_CREATOR" | "ADD_ACCOUNT"
  
export interface Creator  {
    creatorId: string,
    walletId?: string | undefined,
    createdAt: Date,
    accountId: string,
    creatorDID: string,
    creatorTopicId: string,
    globalTopicId: string,
    eventType: EventType,
    info?: Record<string, unknown> | undefined,
    publicKey: string,
    eventId: string; 
    cids: CidsEvent[],
    assetId: string,
    phoneHash?: string | undefined
}

export type CreatorPublic = Omit<Creator, "pinHash" | "info">


export interface ICreator extends Creator, Document {}

/* export interface Asset {
  assetId: string;
  topicId: string;
  creatorId: string;
  hash: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  derivedFrom?: string;
} */

export type CidsEvent = {
    eventType: EventType,
    cid: string,
    createdAt: string
}
type PhoneHashes = {
    oldPhoneHash?: string,
    newPhoneHash: string
}

export interface Event {
  creatorDID?: string
  creatorId: string;
  createdAt: string;
  eventId: string; //i change to optional still checking
  assetId?: string;
  creatorTopicId?: TopicId;
  globalTopicId?: TopicId;
  newCreatorId?: string;
  latestCreatedAt?: number;
  payload?: Record<string, any>;
  cids: CidsEvent[],
  accountId: string,
  publicKey?: string,
  eventType: EventType,
  topicId?: string,
  //phoneHashes: PhoneHashes
}
