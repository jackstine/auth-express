


/**
 * 
 * @param {*any} prototypeToAdd 
 * @param {*any} addToThisPrototype 
 * @param {*Array} skip takes in the prototype of 
 */
export const addPrototype = function(prototypeToAdd, addToThisPrototype, includeExclude) {
    let createdObject = Object.create(prototypeToAdd);
    let proto = createdObject.prototype;

    if (includeExclude.include) {
        let include = createTrueDict(includeExclude.include);
        for(let key of Object.getOwnPropertyNames(proto)) {
            if (include[key]) {
                addToThisPrototype.prototype[key] = proto[key];
            }
        }
    }
    else {
        //Never passes the constructor.
        let skipObject = createTrueDict(includeExclude.exclude);
        skipObject["constructor"] = true;
        for(let key of Object.getOwnPropertyNames(proto)) {
            if (!skipObject[key]) {
                addToThisPrototype.prototype[key] = proto[key];
            }
        }
    }    
}


export const createTrueDict = function(aList){
    let dict = {};
    for(let k of aList) {
        dict[k] = true;
    }
    return dict;
}

