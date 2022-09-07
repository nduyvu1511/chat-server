import { DEFAULT_MESSAGE } from "../constant"

interface ResponseErrorType {
  message: string
  success?: boolean
  status_code?: number
  data?: any
}

export default class ResponseError implements ResponseErrorType {
  message: string = DEFAULT_MESSAGE
  success
  status_code = 400
  data = null

  constructor(message: string, status_code = 400, success = false, data = null) {
    this.message = message
    this.success = success
    this.status_code = status_code
    this.data = data
  }
}
