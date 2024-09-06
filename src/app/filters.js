//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//
const fs = require('fs');

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Load data from json
addFilter('read_json', function (filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
});

// Turn an object into an array of its values
addFilter('values', function (object) {
    return Object.values(object);
})

// Merge two objects together, useful for when you're conditionally showing an error message
addFilter('merge', function (obj1, obj2) {
    if (Array.isArray(obj1) && Array.isArray(obj2))
        return obj1.concat(obj2);

    return Object.assign({}, obj1, obj2);
});

// Find an item in an array
addFilter('find', function (array, attr, value) {
    return array.find(obj => {
        return obj[attr] == value
    });
})

// Return the object's attribute's value
addFilter('value', function (obj, attr) {
    if (obj)
        return obj[attr];
    return '';
})

// Add an object to an array
addFilter('push', function (arr, obj) {
    if (arr)
        arr.push(obj);
    else
        arr = [obj];

    return arr;
})

// counts the number of elements in an array's attribute (assuming that attribute has the property 'length')
addFilter('countArr', function (arr, attr) {
    let count = 0;

    if (!arr)
        return count;

    arr.forEach(element => {
        if (element[attr])
            count = count + element[attr].length;
    });

    return count;
})

// searches through an array for items containing an attribute with the given value and returns the collection
addFilter('search', function (obj, arrAttr, attr, value) {
    let results = [];

    if (obj[arrAttr])
        obj[arrAttr].forEach(element => {
            if (element[attr] && element[attr] == value)
                results.push(element);
        });

    return results;
})

addFilter('equals', function (leftHandSide, rightHandSide, ifTrue, ifFalse) {
    if (leftHandSide == rightHandSide)
        return ifTrue;

    return ifFalse;
})

addFilter('isLegalEntityContactsComplete', function (legalEntities, regFunctions) {
    let valid = true;

    legalEntities.forEach(org => {
        regFunctions.forEach(function (regFunc) {
            // Check if this regulatory function already exists in legalEntityContacts
            if (org.legalEntityContacts) {
                const hasContactForRegFunc = org.legalEntityContacts.some(contact => contact.legalEntity === regFunc);

                if (!hasContactForRegFunc) {
                    valid = false;
                }
            } else {
                valid = false;
            }
        });
    });

    return valid;
})