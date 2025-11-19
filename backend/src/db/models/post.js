import mongoose, { Schema } from 'mongoose'

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    contents: String,
    tags: [String],
    endDate: Number,
    currBidAmt: { type: Number, default: 0, min: 0 },
    currBidder: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    bidHistory: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
          amount: { type: Number, required: true, min: 0 },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

export const Post = mongoose.model('post', postSchema)
