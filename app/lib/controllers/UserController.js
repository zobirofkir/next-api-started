import BaseController from "./BaseController";
import User from "@/app/lib/models/User";

class UserController extends BaseController {
    /**
     * List All Users
     */
    static async index() 
    {
        return await this.withConnection(() => User.find());
    }

    /**
     * Find the user by id
     */
    static async show(id)
    {
        return await this.withConnection(() => User.findById(id));
    }

}

export default UserController;