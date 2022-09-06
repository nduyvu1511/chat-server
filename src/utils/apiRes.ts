import { DEFAULT_MESSAGE } from "../constant"
import { ResponseType } from "./../types/commonType"

export default class ResponseData<T> implements ResponseType<T> {
  message: string = DEFAULT_MESSAGE
  success: boolean
  error_code: number
  data: T

  constructor(data: T, message = DEFAULT_MESSAGE, error_code = 200, success = true) {
    this.message = message
    this.success = success
    this.error_code = error_code
    this.data = data
  }
}
