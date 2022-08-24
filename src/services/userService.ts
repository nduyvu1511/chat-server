import User from "../models/user"
import { CreateUserParams } from "../types"

export class UserService {
  async createUser(user: CreateUserParams) {
    const userRes = new User(user)
    await userRes.save()
  }
}
