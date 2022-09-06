import { DEFAULT_MESSAGE } from "../constant"

interface ResponseErrorType {
  message: string
  success?: boolean
  error_code?: number
  data?: any
}

export default class ResponseError implements ResponseErrorType {
  message: string = DEFAULT_MESSAGE
  success
  error_code = 400
  data = null

  constructor(message: string, error_code = 400, success = false, data = null) {
    this.message = message
    this.success = success
    this.error_code = error_code
    this.data = data
  }
}
