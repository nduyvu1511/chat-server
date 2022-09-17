import Tag from "../models/tag"
import {
  CreateTagMessage,
  GetTagMessageList,
  ITag,
  ListRes,
  TagRes,
  UpdateTagMessage,
} from "../types"
import { toListResponse, toTagListResponse, toTagResponse } from "../utils"

export class TagService {
  async getTagMessageList({
    filter,
    limit,
    offset,
  }: GetTagMessageList): Promise<ListRes<TagRes[]>> {
    const data: ITag[] = await Tag.find(filter).limit(limit).skip(offset).lean()
    const total = await Tag.countDocuments(filter)
    return toListResponse({
      total,
      limit,
      offset,
      data: toTagListResponse(data),
    })
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
