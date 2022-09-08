import { AttachmentRes, IAttachment, ITag, ListParams, ListRes, TagRes } from "../types"

export const toAttachmentResponse = (params: IAttachment): AttachmentRes => {
  return {
    _id: params._id,
    thumbnail_url: params.thumbnail_url || "",
    url: params.url || "",
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

export const toListResponse = <T>(params: ListParams<T>): ListRes<T> => {
  const { data, limit, offset, total } = params
  return {
    limit,
    offset,
    total,
    hasMore: (data as any).length + offset <= total,
    data,
  }
}
