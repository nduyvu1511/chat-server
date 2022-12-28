import dotenv from "dotenv"
import * as OneSignal from 'onesignal-node';
dotenv.config()

const API_KEY = process.env.APP_KEY as string;
const ONESIGNAL_APP_ID = process.env.APP_ID as string;

class PushNotiService {
  async createNotication(body: object) {
    const client = new OneSignal.Client(ONESIGNAL_APP_ID, API_KEY);
    await client.createNotification(body);
  }
}

export default new PushNotiService()
