export const typeDefs = `#graphql
  type Message {
    id: ID!
    from: String!
    subject: String!
    content: String!
    html: String
    receivedAt: String!
  }

  type TempEmail {
    id: ID!
    email: String!
    expiresAt: String!
    messages: [Message!]!
  }

  type Query {
    """
    Get temporary email status and details
    """
    tempEmail(email: String!): TempEmail

    """
    Get messages for a temporary email
    """
    messages(email: String!): [Message!]!
  }

  type Mutation {
    """
    Generate a new temporary email
    """
    generateEmail: TempEmail!

    """
    Extend email expiration time by 24 hours
    """
    extendEmailTime(email: String!): TempEmail!

    """
    Send a test email
    """
    sendTestEmail(to: String!, subject: String!, content: String!): Boolean!
  }

  type Subscription {
    """
    Subscribe to new messages for a specific email
    """
    newMessage(email: String!): Message!
  }
`; 