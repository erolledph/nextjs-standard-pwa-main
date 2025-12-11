export interface Subscriber {
  id: string
  email: string
  subscribedAt: Date
  source?: string
  verified?: boolean
  unsubscribed?: boolean
  postSlug?: string
}

export interface SubscriberCreatePayload {
  email: string
  source?: string
  postSlug?: string
}

export interface SubscriberResponse {
  message: string
  subscriberId: string
}
