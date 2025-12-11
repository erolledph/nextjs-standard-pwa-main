export interface Comment {
  id: string
  postSlug: string
  author: string
  email: string
  content: string
  createdAt: Date
  approved: boolean
  isAdmin?: boolean
  parentId?: string
  mentionedUser?: string
}

export interface CommentCreatePayload {
  postSlug: string
  author: string
  email: string
  content: string
  parentId?: string
}

export interface CommentResponse {
  message: string
  commentId: string
}
