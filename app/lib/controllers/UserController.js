import connect from "@/app/lib/db";
import User from "@/app/lib/models/User";

class UserController {
    static async index() {
        await connect();
        return await User.find();
    }
}

export default UserController;