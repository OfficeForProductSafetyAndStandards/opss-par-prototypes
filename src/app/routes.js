//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');

// Route for Create Organisation "Do you have access to the companies house number?"
// If the user has said they know the companies house number:
//  This looks in the organisations.json file for the companies house number.
//  If it finds it, we set the organisation's details.
//  If not, then we redirect them back and set the error.
// Otherwise, we clear the organisation details and redirect them to start creating the organisation.
router.post('/partnership-application/legal-entities/create-organisation/companies-house-answer', function (req, res) {
    let hasCompaniesHouseNumber = req.session.data['have-companies-house-number']
    req.session.data['companies-house-number-error'] = false;

    if (hasCompaniesHouseNumber == "yes") {
        const fileContent = fs.readFileSync("./app/data/organisations.json", 'utf8');
        let organisations = JSON.parse(fileContent);
        const companiesHouseNumber = req.session.data['companies-house-number'];
        const organisation = organisations.find(org => org.companiesHouseNumber === companiesHouseNumber);

        if (organisation) {
            req.session.data['new-organisation'] = organisation;
            let legalEntity = req.session.data['legal-entity-types'].find(obj => {
                return obj['value'] == req.session.data['legal-entity-type']
            });
            req.session.data['new-organisation'].legalEntityType = legalEntity.text;
            res.redirect('/partnership-application/legal-entities/create-organisation/organisation-confirmation');
        } else {
            req.session.data['companies-house-number-error'] = true;
            res.redirect('/partnership-application/legal-entities/create-organisation/have-companies-house-number');
        }
    } else {
        req.session.data['new-organisation'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-name');
    }
})

// Route for Create Organisation "Is this the organisation you want to form a partnership with?"
router.post('/partnership-application/legal-entities/create-organisation/confirm-organisation-answer', function (req, res) {
    let isOrganisationCorrect = req.session.data['is-organisation-correct']
    if (isOrganisationCorrect == "yes-add") {
        req.session.data['legal-entites'].push(req.session.data['new-organisation']);
        req.session.data['new-organisation'] = undefined;
        res.redirect('/partnership-application/legal-entities/list');
    } else if (isOrganisationCorrect == "no-search") {
        res.redirect('/partnership-application/legal-entities/create-organisation/have-companies-house-number');
    } else {
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-name');
    }
})

router.post('/partnership-application/legal-entities/create-organisation/new-organisation-answer', function (req, res) {
    let org = {
        "tradingName": req.session.data['organisation-name'],
        "legalEntityType": req.session.data['legal-entity-type'],
        "address": {
            "line1": req.session.data['address-line-1'],
            "line2": req.session.data['address-line-2'],
            "town": req.session.data['address-town'],
            "county": req.session.data['address-county'],
            "postcode": req.session.data['address-postcode'],
        }
    };

    req.session.data['legal-entites'].push(org);

    req.session.data['organisation-name'] = undefined;
    req.session.data['address-line-1'] = undefined;
    req.session.data['address-line-2'] = undefined;
    req.session.data['address-town'] = undefined;
    req.session.data['address-county'] = undefined;
    req.session.data['address-postcode'] = undefined;

    req.session.data['legal-entity-success-message'] = org.tradingName + " has been added as a legal entity to your application";

    res.redirect('/partnership-application/legal-entities/list');
})

// Route for Select the organisation for your partnership
// If the user clicks to select an organisation
// we load the orgnisations file and load the correct index'd item
router.get('/partnership-application/legal-entities/select-partnership', function (req, res) {
    const fileContent = fs.readFileSync("./app/data/organisations.json", 'utf8');
    let organisations = JSON.parse(fileContent);

    let index = parseInt(req.query.index);

    if (!req.session.data['legal-entites'])
        req.session.data['legal-entites'] = [];

    req.session.data['legal-entites'].push(organisations[index]);

    req.session.data['legal-entity-success-message'] = organisations[index].tradingName + " has been added as a legal entity to your application";

    res.redirect('/partnership-application/legal-entities/list');
})

// Route for removing a legal entity from the list
router.get('/partnership-application/legal-entities/remove-partnership', function (req, res) {
    let index = parseInt(req.query.index);

    let list = req.session.data['legal-entites'];
    let item = list[index];
    delete list[index];

    if (!list)
        list = [];

    req.session.data['legal-entites'] = list.filter(n => n);

    req.session.data['legal-entity-success-message'] = item.tradingName + " has been removed from your application";
    res.redirect('/partnership-application/legal-entities/list');
})

// Route to go to the legal-entity list
router.get('/partnership-application/legal-entities/show-list', function (req, res) {
    req.session.data['legal-entity-success-message'] = undefined;
    res.redirect('/partnership-application/legal-entities/list');
})

// Route to go to the additional-addresses list
router.get('/partnership-application/additional-addresses/show-list', function (req, res) {
    req.session.data['additional-addresses-success-message'] = undefined;
    res.redirect('/partnership-application/additional-addresses/list');
})

// Route to go to the add-additional-addresses list
router.get('/partnership-application/additional-addresses/show-add-address', function (req, res) {
    let index = parseInt(req.query.index);
    let list = req.session.data['legal-entites'];

    req.session.data['selected-legal-entity'] = list[index];
    req.session.data['selected-legal-entity-index'] = index;
    res.redirect('/partnership-application/additional-addresses/add-address');
})

// Route to add address
router.post('/partnership-application/additional-addresses/add-address-answer', function (req, res) {
    let index = req.session.data['selected-legal-entity-index'];
    let list = req.session.data['legal-entites'];
    let org = req.session.data['selected-legal-entity'];

    let address = {
        "line1": req.session.data['address-line-1'],
        "line2": req.session.data['address-line-2'],
        "town": req.session.data['address-town'],
        "county": req.session.data['address-county'],
        "postcode": req.session.data['address-postcode'],
    };

    if (!list[index].additionalAddress) {
        list[index].additionalAddress = [];
    }

    list[index].additionalAddress.push(address);
    req.session.data['legal-entites'] = list;

    req.session.data['address-line-1'] = undefined;
    req.session.data['address-line-2'] = undefined;
    req.session.data['address-town'] = undefined;
    req.session.data['address-county'] = undefined;
    req.session.data['address-postcode'] = undefined;
    req.session.data['selected-legal-entity-index'] = undefined;
    req.session.data['selected-legal-entity'] = undefined;

    req.session.data['additional-addresses-success-message'] = "Address has been added to " + org.tradingName;

    res.redirect('/partnership-application/additional-addresses/list');
})

// Route to go to the edit-additional-addresses list
router.get('/partnership-application/additional-addresses/show-edit-address', function (req, res) {
    let entityIndex = parseInt(req.query.entity);
    let addressIndex = parseInt(req.query.address);

    let list = req.session.data['legal-entites'];
    let address = list[entityIndex].additionalAddress[addressIndex];

    req.session.data['address-line-1'] = address.line1;
    req.session.data['address-line-2'] = address.line2;
    req.session.data['address-town'] = address.town;
    req.session.data['address-county'] = address.county;
    req.session.data['address-postcode'] = address.postcode;

    req.session.data['selected-legal-entity-index'] = entityIndex;
    req.session.data['selected-legal-entity-address-index'] = addressIndex;
    res.redirect('/partnership-application/additional-addresses/edit-address');
})

// Route to update the address
router.post('/partnership-application/additional-addresses/edit-address-answer', function (req, res) {
    let entityIndex = req.session.data['selected-legal-entity-index'];
    let addressIndex = req.session.data['selected-legal-entity-address-index'];
    let list = req.session.data['legal-entites'];

    let address = {
        "line1": req.session.data['address-line-1'],
        "line2": req.session.data['address-line-2'],
        "town": req.session.data['address-town'],
        "county": req.session.data['address-county'],
        "postcode": req.session.data['address-postcode'],
    };

    list[entityIndex].additionalAddress[addressIndex] = address;
    req.session.data['legal-entites'] = list;

    req.session.data['address-line-1'] = undefined;
    req.session.data['address-line-2'] = undefined;
    req.session.data['address-town'] = undefined;
    req.session.data['address-county'] = undefined;
    req.session.data['address-postcode'] = undefined;
    req.session.data['selected-legal-entity-index'] = undefined;
    req.session.data['selected-legal-entity-address-index'] = undefined;

    req.session.data['additional-addresses-success-message'] = "Address has been updated";

    res.redirect('/partnership-application/additional-addresses/list');
})

// Route to remove an address
router.get('/partnership-application/additional-addresses/remove-address', function (req, res) {
    let entityIndex = parseInt(req.query.entity);
    let addressIndex = parseInt(req.query.address);

    let list = req.session.data['legal-entites'];

    delete list[entityIndex].additionalAddress[addressIndex];

    if (!list[entityIndex].additionalAddress)
        list[entityIndex].additionalAddress = [];

    list[entityIndex].additionalAddress = list[entityIndex].additionalAddress.filter(n => n);

    req.session.data['legal-entites'] = list;

    req.session.data['additional-addresses-success-message'] = "Address has neem removed";

    res.redirect('/partnership-application/additional-addresses/list');
})

// Route to go to the contact-details list
router.get('/partnership-application/contact-details/show-list', function (req, res) {
    req.session.data['contact-details-success-message'] = undefined;
    res.redirect('/partnership-application/contact-details/list');
})

// Route to go to the contact-details list
router.get('/partnership-application/contact-details/show-add-contact', function (req, res) {
    let index = parseInt(req.query.index);

    let list = req.session.data['legal-entites'];

    req.session.data['selected-legal-entity'] = list[index];
    req.session.data['selected-legal-entity-index'] = index;

    res.redirect('/partnership-application/contact-details/add/regulatory-function');
})

router.post('/partnership-application/contact-details/add/save-contact', function (req, res) {
    let index = req.session.data['selected-legal-entity-index'];
    let list = req.session.data['legal-entites'];
    let org = req.session.data['selected-legal-entity'];
    let functions = req.session.data['session-regulatory-functions'];

    if (!list[index].legalEntityContacts) {
        list[index].legalEntityContacts = [];
    }

    functions.forEach(entity => {
        list[index].legalEntityContacts.push({
            "firstName": req.session.data['new-contact-first-name'],
            "lastName": req.session.data['new-contact-last-name'],
            "phoneNumber": req.session.data['new-contact-phone-number'],
            "emailAddress": req.session.data['new-contact-email-address'],
            "legalEntity": entity
        });
    });

    req.session.data['legal-entites'] = list;

    req.session.data['new-contact-first-name'] = undefined;
    req.session.data['new-contact-last-name'] = undefined;
    req.session.data['new-contact-phone-number'] = undefined;
    req.session.data['new-contact-email-address'] = undefined;

    req.session.data['selected-legal-entity-index'] = undefined;
    req.session.data['selected-legal-entity'] = undefined;

    req.session.data['contact-details-success-message'] = "Contact added to " + org.tradingName;
    res.redirect('/partnership-application/contact-details/list');
})