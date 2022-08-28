import { DEFAULT_MESSAGE } from "../constant"
import { ResponseType } from "./../types/commonType"

export default class ResponseData<T> implements ResponseType<T> {
  message: string = DEFAULT_MESSAGE
  success: boolean
  error_code: number
  data: T

  constructor(message: string, error_code: number, success: boolean, data: T) {
    this.message = message
    this.success = success
    this.error_code = error_code
    this.data = data
  }
}
