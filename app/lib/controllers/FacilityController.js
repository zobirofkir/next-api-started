import FacilityResource from "../resources/FacilityResource";
import BaseController from "./BaseController";
import Facility from "@/app/lib/models/Facility";

class FacilityController extends BaseController {
    /**
     * List All Facilities
     */
    static async index() {
        const facilities = await this.withConnection(() => Facility.find());
        return FacilityResource.collection(facilities).toArray();
    }

    /**
     * Find facility by id
     */
    static async show(id) {
        const facility = await this.withConnection(() => Facility.findById(id));
        return FacilityResource.make(facility).toArray();
    }

    /**
     * Create a new facility
     */
    static async store(facilityData) {
        const facility = await this.withConnection(() => Facility.create(facilityData));
        return FacilityResource.make(facility).toArray();
    }

    /**
     * Update facility
     */
    static async update(id, facilityData) {
        const facility = await this.withConnection(() => 
            Facility.findByIdAndUpdate(id, facilityData, { new: true })
        );
        return FacilityResource.make(facility).toArray();
    }

    /**
     * Delete facility
     */
    static async delete(id) {
        return await this.withConnection(() => Facility.findByIdAndDelete(id));
    }

    /**
     * Get facilities by sport type
     */
    static async findBySport(sport) {
        const facilities = await this.withConnection(() => 
            Facility.find({ sport: sport.toLowerCase() })
        );
        return FacilityResource.collection(facilities).toArray();
    }
}

export default FacilityController;
