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