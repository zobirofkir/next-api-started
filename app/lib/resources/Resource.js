class Resource {
    constructor(resource) {
        this.resource = resource;
    }

    toArray() {
        throw new Error('toArray method must be implemented');
    }

    static make(resource) {
        return new this(resource);
    }

    static collection(resources) {
        const ResourceCollection = require('./ResourceCollection').default;
        return new ResourceCollection(resources, this);
    }
}

export default Resource;