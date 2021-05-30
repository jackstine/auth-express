export const addDays = function (d, daysToAdd) {
    let newDate = new Date()
    newDate.setTime(d.getTime() + (1000 * 60 * 60 * 24 * daysToAdd))
    if (newDate.getDate === newDate.getUTCDate()) {
        newDate.setHours(0, 0, 0, 0)
    } else {
        newDate.setUTCHours(0, 0, 0, 0)
        newDate = getUCTCorrectedDate(newDate)
    }
    return newDate
}

export const getUCTCorrectedDate = function (dateString) {
    let start = new Date(dateString)
    var offset = start.getTimezoneOffset()
    start.setTime(start.getTime() + (1000 * 60 * offset))
    return start
}

export const addMinutes = function(date, numOfMinutes) {
    return date.setMinutes(date.getUTCMinutes() + numOfMinutes);
}

export const timeTillAM = function(date) {
    let newDate = new Date(date);
    addDays(newDate, 1);
    // console.log("UTC", new Date(Date.UTC()));
    // console.log("newDate", newDate);
    let timeTillBeginningOfDay = newDate.setUTCHours(0,0,0,0);
    let timeTillDate = date.getTime();
    // console.log(date);
    // console.log(newDate);
    return timeTillBeginningOfDay - timeTillDate
}

//TODO not sure if the getDate should look at the UTCDate, because this will depend on the type of computer
//that one gets, this could be off, since this was created during the time that is based off the stock market
//we will need to make sure that the stock market time is correct when make decisions in UTC, if not
//then I will have to resort to using a StockMarket timing library
export const getDate = function(date) {
    let d = new Date(date);
    d.setUTCDate(0,0,0,0);
    return d;
}

/**
 * the Dates have the same year, month, and date
 */
export const dateIsEql = function(date1, date2) {
    return getDate(date1) == getDate(date2);
}

/**
 * the Dates have the same year, month, and date
 */
export const dateIsGT = function(date1, date2) {
    return getDate(date1) > getDate(date2);
}


/**
 * the Dates have the same year, month, and date
 */
export const dateIsGTE = function(date1, date2) {
    return getDate(date1) >= getDate(date2);
}

/**
 * the Dates have the same year, month, and date
 */
export const dateIsLT = function(date1, date2) {
    return getDate(date1) < getDate(date2);
}

/**
 * the Dates have the same year, month, and date
 */
export const dateIsLTE = function(date1, date2) {
    return getDate(date1) <= getDate(date2);
}

