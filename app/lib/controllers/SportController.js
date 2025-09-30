import Sport from "../models/Sport";
import SportResource from "../resources/SportResource";
import BaseController from "./BaseController";

class SportController extends BaseController
{
    /**
     * Get all Sports
     */
    static async index()
    {
        const sports = await this.withConnection(() => Sport.find());
        return SportResource.collection(sports).toArray();
    }
}

export default SportController;