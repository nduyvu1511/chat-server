import { AttachmentRes, IAttachment, ITag, ListParams, ListRes, TagRes } from "../types"

export const toAttachmentResponse = (params: IAttachment): AttachmentRes => {
  return {
    attachment_id: params?._id || "",
    thumbnail_url: params?.thumbnail_url || null,
    url: params?.url || "",
    attachment_type: params?.attachment_type || "",
  }
}

export const toAttachmentListResponse = (params: IAttachment[]): AttachmentRes[] => {
  return params.map((item) => toAttachmentResponse(item))
}

export const toTagResponse = (params: ITag): TagRes => {
  return {
    tag_id: params._id,
    text: params.text,
  }
}

export const toTagListResponse = (params: ITag[]): TagRes[] => {
  return params.map((item) => toTagResponse(item))
}

export const toListResponse = (params: ListParams<any>): ListRes<any[]> => {
  const { data, limit, offset, total } = params
  return {
    limit,
    offset,
    total,
    hasMore: data.length + offset < total,
    data,
  }
}

export const toDefaultListResponse = (): ListRes<[]> => ({
  data: [],
  limit: 0,
  offset: 0,
  total: 0,
  hasMore: false,
})
