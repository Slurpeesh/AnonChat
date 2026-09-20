import z from 'zod'

const ReplyDataSchema = z
  .object({
    repliedMessageId: z.string(),
    value: z.string(),
    isRepliedMessageMine: z.boolean(),
  })
  .strict()

export const ReplySchema = ReplyDataSchema.nullable()
