import Resource from './Resource';

class SportResource extends Resource {
    toArray() {
        const sport = this.resource || {};

        return {
            id: sport._id,
            name: sport.name,
            type: sport.type,
            description: sport.description,
            level: sport.level,
            isIndoor: sport.isIndoor,
            minPlayers: sport.minPlayers,
            maxPlayers: sport.maxPlayers,
            capacity: sport.capacity,
            pricePerParticipant: sport.pricePerParticipant,
            organizer: sport.organizer ? (sport.organizer._id || sport.organizer) : null,
            participants: Array.isArray(sport.participants) ? sport.participants.map(p => (p._id || p)) : [],
            location: sport.location || null,
            schedule: sport.schedule || null,
            equipment: sport.equipment || [],
            tags: sport.tags || [],
            isCancelled: sport.isCancelled,
            createdAt: sport.createdAt,
            updatedAt: sport.updatedAt
        };
    }
}

export default SportResource;