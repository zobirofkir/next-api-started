import connect from "@/app/lib/connection/db";

class BaseController {
    static async withConnection(callback) {
        await connect();
        return await callback();
    }
}

export default BaseController;