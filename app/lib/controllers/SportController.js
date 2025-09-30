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

    /**
     * Store Sport
     */
    static async store(sportData) 
    {
        const sport = await this.withConnection(() => Sport.create(sportData));
        return SportResource.make(sport).toArray();
    }
}

export default SportController;