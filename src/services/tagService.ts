import Tag from "../models/tag"
import { CreateTagMessage, GetTagMessageList, ITag, UpdateTagMessage } from "../types"

export class TagService {
  async getTagMessageList({ filter, limit, offset }: GetTagMessageList): Promise<ITag[]> {
    return await Tag.find(filter).limit(limit).skip(offset).lean()
  }

  async deleteTagMesasge(tag_id: string): Promise<any> {
    return await Tag.findByIdAndDelete(tag_id)
  }

  async updateTagMessage({ tag_id, ...params }: UpdateTagMessage): Promise<ITag | null> {
    console.log({ params })
    return await Tag.findByIdAndUpdate(tag_id, params, { new: true })
  }

  async createTagMessage(params: CreateTagMessage): Promise<ITag> {
    const tag = new Tag(params)
    return (await tag.save()).toObject()
  }
}

export default new TagService()
