class ResourceCollection {
    constructor(collection, resourceClass) {
        this.collection = collection;
        this.resourceClass = resourceClass;
    }

    toArray() {
        return this.collection.map(item => 
            new this.resourceClass(item).toArray()
        );
    }

    toJson() {
        return JSON.stringify(this.toArray());
    }
}

export default ResourceCollection;