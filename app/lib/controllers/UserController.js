import BaseController from "./BaseController";
import User from "@/app/lib/models/User";

class UserController extends BaseController {
    static async index() {
        return await this.withConnection(() => User.find());
    }
}

export default UserController;