import BaseController from "./BaseController";
import User from "@/app/lib/models/User";
import UserResource from "@/app/lib/resources/UserResource";

class UserController extends BaseController {
    /**
     * List All Users
     */
    static async index() 
    {
        const users = await this.withConnection(() => User.find());
        return UserResource.collection(users).toArray();
    }

    /**
     * Find the user by id
     */
    static async show(id)
    {
        const user = await this.withConnection(() => User.findById(id));
        return UserResource.make(user).toArray();
    }

    /**
     * Store a new user
     */
    static async store(userData)
    {
        const user = await this.withConnection(() => User.create(userData));
        return UserResource.make(user).toArray();
    }

}

export default UserController;