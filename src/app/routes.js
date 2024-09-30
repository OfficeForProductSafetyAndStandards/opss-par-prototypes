//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const fs = require('fs');


//---------------------------------------------------------------------------------------------------
// Partnership Application Process
//---------------------------------------------------------------------------------------------------
router.post('/partnership-application/confirm-agreement-answer', function (req, res) {
    let answer = req.session.data['confirm-agreement'] ?? '';
    if (answer && answer.length == 3) {
        req.session.data['confirm-agreement-invalid'] = undefined;
        res.redirect('/partnership-application/task-list');
    } else {
        req.session.data['confirm-agreement-invalid'] = true;
        res.redirect('/partnership-application/confirm-agreement');
    }
})

router.post('/partnership-application/partnership-type-answer', function (req, res) {
    let answer = req.session.data['partnership-type'];
    if (answer) {
        req.session.data['partnership-type-invalid'] = undefined;
        if (req.session.data['redirected']) {
            res.redirect('/redirect-done?redirect=/partnership-application/check-answers');
        } else {
            res.redirect('/redirect-done?redirect=/partnership-application/task-list');
        }
    } else {
        req.session.data['partnership-type-invalid'] = true;
        res.redirect('/partnership-application/partnership-type');
    }
})

router.post('/partnership-application/legal-entities/create-organisation/legal-entity-type-answer', function (req, res) {
    let answer = req.session.data['legal-entity-type'];
    if (answer) {
        req.session.data['legal-entity-type-invalid'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/have-companies-house-number');
    } else {
        req.session.data['legal-entity-type-invalid'] = true;
        res.redirect('/partnership-application/legal-entities/create-organisation/legal-entity-type');
    }
})

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
        req.session.data['have-companies-house-number-invalid'] = undefined;
        const fileContent = fs.readFileSync("./app/data/organisations.json", 'utf8');
        let organisations = JSON.parse(fileContent);
        const companiesHouseNumber = req.session.data['companies-house-number'];
        const organisation = organisations.find(org => org.companiesHouseNumber == companiesHouseNumber);

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
    } else if (hasCompaniesHouseNumber == "no") {
        req.session.data['new-organisation'] = undefined;
        req.session.data['have-companies-house-number-invalid'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-name');
    } else {
        req.session.data['have-companies-house-number-invalid'] = true;
        res.redirect('/partnership-application/legal-entities/create-organisation/have-companies-house-number');
    }
})

// Route for Create Organisation "Is this the organisation you want to form a partnership with?"
router.post('/partnership-application/legal-entities/create-organisation/confirm-organisation-answer', function (req, res) {
    let isOrganisationCorrect = req.session.data['is-organisation-correct']
    if (isOrganisationCorrect == "yes-add") {
        req.session.data['is-organisation-correct-invalid'] = undefined;
        req.session.data['legal-entites'].push(req.session.data['new-organisation']);
        req.session.data['new-organisation'] = undefined;
        res.redirect('/partnership-application/legal-entities/list');
    } else if (isOrganisationCorrect == "no-search") {
        req.session.data['is-organisation-correct-invalid'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/have-companies-house-number');
    } else if (isOrganisationCorrect == "no-enter-manually") {
        req.session.data['is-organisation-correct-invalid'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-name');
    } else {
        req.session.data['is-organisation-correct-invalid'] = true;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-confirmation');
    }
})

router.post('/partnership-application/legal-entities/create-organisation/organisation-name-answer', function (req, res) {
    let answer = req.session.data['legal-name'];
    if (answer) {
        req.session.data['legal-name-invalid'] = undefined;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-address');
    } else {
        req.session.data['legal-name-invalid'] = true;
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-name');
    }
})

router.post('/partnership-application/legal-entities/create-organisation/organisation-address-answer', function (req, res) {
    let line1 = req.session.data['address-line-1'];
    let town = req.session.data['address-town'];
    let postcode = req.session.data['address-postcode'];

    req.session.data['address-line-1-invalid'] = undefined;
    req.session.data['address-town-invalid'] = undefined;
    req.session.data['address-postcode-invalid'] = undefined;

    if (line1 && town && postcode) {
        res.redirect('/partnership-application/legal-entities/create-organisation/business-area');
    } else {
        if (!line1) {
            req.session.data['address-line-1-invalid'] = true;
        }
        if (!town) {
            req.session.data['address-town-invalid'] = true;
        }
        if (!postcode) {
            req.session.data['address-postcode-invalid'] = true;
        }
        res.redirect('/partnership-application/legal-entities/create-organisation/organisation-address');
    }
})

router.post('/partnership-application/legal-entities/create-organisation/belongs-to-group-answer', function (req, res) {
    let answer = req.session.data['belongs-to-group'];
    if (answer) {
        req.session.data['belongs-to-group-invalid'] = undefined;
        if (answer == "yes")
            res.redirect('/partnership-application/legal-entities/create-organisation/select-group');
        else {
            res.redirect('/partnership-application/legal-entities/create-organisation/new-organisation-answer');
        }
    } else {
        req.session.data['belongs-to-group-invalid'] = true;
        res.redirect('/partnership-application/legal-entities/create-organisation/belongs-to-group');
    }
})

router.get('/partnership-application/legal-entities/create-organisation/select-group-answer', function (req, res) {
    const fileContent = fs.readFileSync("./app/data/groups.json", 'utf8');
    let groups = JSON.parse(fileContent);

    let index = parseInt(req.query.index);

    req.session.data['group-name'] = groups[index].groupName;

    res.redirect('/partnership-application/legal-entities/create-organisation/new-organisation-answer');
})

router.get('/partnership-application/legal-entities/create-organisation/new-organisation-answer', function (req, res) {
    let groupName = null;
    if (req.session.data['group-name']) {
        groupName = req.session.data['group-name'];
    }

    let org = {
        "legalName": req.session.data['legal-name'],
        "tradingName": req.session.data['trading-name'],
        "groupName": groupName,
        "legalEntityType": req.session.data['legal-entity-type'],
        "businessArea": req.session.data['business-area'],
        "address": {
            "line1": req.session.data['address-line-1'],
            "line2": req.session.data['address-line-2'],
            "town": req.session.data['address-town'],
            "county": req.session.data['address-county'],
            "postcode": req.session.data['address-postcode'],
        }
    };

    req.session.data['legal-entites'].push(org);

    req.session.data['have-companies-house-number'] = undefined;
    req.session.data['legal-entity-type'] = undefined;
    req.session.data['legal-name'] = undefined;
    req.session.data['trading-name'] = undefined;
    req.session.data['address-line-1'] = undefined;
    req.session.data['address-line-2'] = undefined;
    req.session.data['address-town'] = undefined;
    req.session.data['address-county'] = undefined;
    req.session.data['address-postcode'] = undefined;
    req.session.data['group-name'] = undefined;
    req.session.data['business-area'] = undefined;
    req.session.data['belongs-to-group'] = undefined;

    req.session.data['legal-entity-success-message'] = org.legalName + " has been added as a legal entity to your application";

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

    req.session.data['legal-entity-success-message'] = organisations[index].legalName + " has been added as a legal entity to your application";

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

    req.session.data['legal-entity-success-message'] = item.legalName + " has been removed from your application";
    res.redirect('/partnership-application/legal-entities/list');
})

// Route to go to the regulatory-function-contacts list
router.get('/partnership-application/regulatory-function-contacts/show-list', function (req, res) {
    req.session.data['new-contact-regulatory-function'] = undefined;
    req.session.data['regulatory-function-contacts-success-message'] = undefined;
    res.redirect('/partnership-application/regulatory-function-contacts/list');
})

router.post('/partnership-application/regulatory-function-contacts/details-answer', function (req, res) {
    let contacts = req.session.data['local-authority-contacts'];
    let index = req.session.data['new-regulatory-function-contact'];
    let functions = req.session.data['new-contact-regulatory-function'];

    let selectedContact = contacts[index];

    if (!req.session.data['regulatory-function-contacts'])
        req.session.data['regulatory-function-contacts'] = [];

    functions.forEach(regulatoryFunction => {
        req.session.data['regulatory-function-contacts'].push({
            "firstName": selectedContact.firstName,
            "lastName": selectedContact.lastName,
            "emailAddress": selectedContact.emailAddress,
            "regulatoryFunction": regulatoryFunction
        });
    });

    res.redirect('/partnership-application/regulatory-function-contacts/show-list');
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

    req.session.data['additional-addresses-success-message'] = "Address has been added to " + org.legalName;

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
    let functions = req.session.data['new-contact-regulatory-function'];

    if (!list[index].legalEntityContacts) {
        list[index].legalEntityContacts = [];
    }

    req.session.data['new-contact-first-name-invalid'] = undefined;
    req.session.data['new-contact-last-name-invalid'] = undefined;
    req.session.data['new-contact-phone-number-invalid'] = undefined;
    req.session.data['new-contact-email-address-invalid'] = undefined;
    req.session.data['new-contact-regulatory-function'] = undefined;

    let firstName = req.session.data['new-contact-first-name']
    let lastName = req.session.data['new-contact-last-name']
    let phoneNumber = req.session.data['new-contact-phone-number']
    let emailAddress = req.session.data['new-contact-email-address']

    if (firstName && lastName && phoneNumber && emailAddress) {
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

        req.session.data['contact-details-success-message'] = "Contact added to " + org.legalName;
        res.redirect('/partnership-application/contact-details/list');
    } else {
        if (!firstName) {
            req.session.data['new-contact-first-name-invalid'] = true;
        }
        if (!lastName) {
            req.session.data['new-contact-last-name-invalid'] = true;
        }
        if (!phoneNumber) {
            req.session.data['new-contact-phone-number-invalid'] = true;
        }
        if (!emailAddress) {
            req.session.data['new-contact-email-address-invalid'] = true;
        }
        res.redirect('/partnership-application/contact-details/add/details');
    }
})

router.get('/partnership-application/contact-details/add/copy-primary-contact', function (req, res) {

    req.session.data['new-contact-first-name'] = req.session.data['primary-first-name'];
    req.session.data['new-contact-last-name'] = req.session.data['primary-last-name'];
    req.session.data['new-contact-phone-number'] = req.session.data['primary-phone-number'];
    req.session.data['new-contact-email-address'] = req.session.data['primary-email-address'];

    res.redirect('/partnership-application/contact-details/add/details');
})

// Route to go to the edit-contact list
router.get('/partnership-application/contact-details/show-edit-contact', function (req, res) {
    let entityIndex = parseInt(req.query.entity);
    let contactIndex = parseInt(req.query.contact);

    let list = req.session.data['legal-entites'];
    let contact = list[entityIndex].legalEntityContacts[contactIndex];

    req.session.data['new-contact-first-name'] = contact.firstName;
    req.session.data['new-contact-last-name'] = contact.lastName;
    req.session.data['new-contact-phone-number'] = contact.phoneNumber;
    req.session.data['new-contact-email-address'] = contact.emailAddress;

    req.session.data['selected-legal-entity'] = list[entityIndex];
    req.session.data['selected-legal-entity-index'] = entityIndex;
    req.session.data['selected-legal-entity-contact-index'] = contactIndex;

    res.redirect('/partnership-application/contact-details/edit/details');
})

router.get('/partnership-application/contact-details/edit/copy-primary-contact', function (req, res) {

    req.session.data['new-contact-first-name'] = req.session.data['primary-first-name'];
    req.session.data['new-contact-last-name'] = req.session.data['primary-last-name'];
    req.session.data['new-contact-phone-number'] = req.session.data['primary-phone-number'];
    req.session.data['new-contact-email-address'] = req.session.data['primary-email-address'];

    res.redirect('/partnership-application/contact-details/edit/details');
})

router.post('/partnership-application/contact-details/edit/save-contact', function (req, res) {
    let entityIndex = req.session.data['selected-legal-entity-index'];
    let contactIndex = req.session.data['selected-legal-entity-contact-index'];
    let org = req.session.data['selected-legal-entity'];

    let list = req.session.data['legal-entites'];

    list[entityIndex].legalEntityContacts[contactIndex].firstName = req.session.data['new-contact-first-name'];
    list[entityIndex].legalEntityContacts[contactIndex].lastName = req.session.data['new-contact-last-name'];
    list[entityIndex].legalEntityContacts[contactIndex].phoneNumber = req.session.data['new-contact-phone-number'];
    list[entityIndex].legalEntityContacts[contactIndex].emailAddress = req.session.data['new-contact-email-address'];

    req.session.data['legal-entites'] = list;

    req.session.data['new-contact-first-name'] = undefined;
    req.session.data['new-contact-last-name'] = undefined;
    req.session.data['new-contact-phone-number'] = undefined;
    req.session.data['new-contact-email-address'] = undefined;

    req.session.data['selected-legal-entity-index'] = undefined;
    req.session.data['selected-legal-entity'] = undefined;
    req.session.data['selected-legal-entity-contact-index'] = undefined;

    req.session.data['contact-details-success-message'] = "Contact updated for " + org.legalName;
    res.redirect('/partnership-application/check-answers');
})

router.post('/partnership-application/contact-details/primary-contact-answer', function (req, res) {
    let firstName = req.session.data['primary-first-name'];
    let lastName = req.session.data['primary-last-name'];
    let phoneNumber = req.session.data['primary-phone-number'];
    let emailAddress = req.session.data['primary-email-address'];

    req.session.data['primary-first-name-invalid'] = undefined;
    req.session.data['primary-last-name-invalid'] = undefined;
    req.session.data['primary-phone-number-invalid'] = undefined;
    req.session.data['primary-email-address-invalid'] = undefined;

    if (firstName && lastName && phoneNumber && emailAddress) {
        if (req.session.data['redirected']) {
            res.redirect('/redirect-done?redirect=/partnership-application/check-answers');
        } else {
            res.redirect('/redirect-done?redirect=/partnership-application/task-list');
        }
    } else {
        if (!firstName) {
            req.session.data['primary-first-name-invalid'] = true;
        }
        if (!lastName) {
            req.session.data['primary-last-name-invalid'] = true;
        }
        if (!phoneNumber) {
            req.session.data['primary-phone-number-invalid'] = true;
        }
        if (!emailAddress) {
            req.session.data['primary-email-address-invalid'] = true;
        }
        res.redirect('/partnership-application/contact-details/primary-contact');
    }
})

router.post('/partnership-application/try-submit', function (req, res) {
    let confirm = req.session.data['confirm'];

    if (confirm == 'confirm') {
        req.session.data['confirm-invalid'] = undefined;

        // Reset session data
        for (let property in req.session.data) {
            if (req.session.data.hasOwnProperty(property)) {
                if (!['legal-entity-types', 'regulatory-functions', 'session-regulatory-functions', 'primary-email-address'].includes(property)) {
                    req.session.data[property] = undefined;
                }
            }
        }

        res.redirect('/partnership-application/confirmation');
    }
    else {
        req.session.data['confirm-invalid'] = true;
        res.redirect('/partnership-application/check-answers');
    }
})

//---------------------------------------------------------------------------------------------------
// Partnership Application Review Process
//---------------------------------------------------------------------------------------------------
router.post('/partnership-application-review/partnership-type-answer', function (req, res) {
    let answer = req.session.data['partnership-type-review'];

    if (!answer) {
        req.session.data['partnership-type-review-invalid'] = true;
        res.redirect('/partnership-application-review/partnership-type');
    } else {
        req.session.data['partnership-type-confirmed'] = answer;
        req.session.data['partnership-type-review-invalid'] = undefined;
        if (answer == "no") {
            res.redirect('/partnership-application-review/partnership-type-query');
        } else {
            if (req.session.data['redirected']) {
                res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
            } else {
                res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
            }
        }
    }
})

router.post('/partnership-application-review/primary-authority-name-answer', function (req, res) {
    let answer = req.session.data['primary-authority-name-review'];

    if (!answer) {
        req.session.data['primary-authority-name-review-invalid'] = true;
        res.redirect('/partnership-application-review/primary-authority-name');
    } else {
        req.session.data['primary-authority-name-confirmed'] = answer;
        req.session.data['primary-authority-name-review-invalid'] = undefined;
        if (answer == "no") {
            res.redirect('/partnership-application-review/primary-authority-name-query');
        } else {
            if (req.session.data['redirected']) {
                res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
            } else {
                res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
            }
        }
    }
})

router.post('/partnership-application-review/legal-entities-answer', function (req, res) {
    let answer = req.session.data['legal-entities-review'];

    if (!answer) {
        req.session.data['legal-entities-review-invalid'] = true;
        res.redirect('/partnership-application-review/legal-entities');
    } else {
        req.session.data['legal-entities-confirmed'] = answer;
        req.session.data['legal-entities-review-invalid'] = undefined;
        if (answer == "no") {
            res.redirect('/partnership-application-review/legal-entities-query');
        } else {
            if (req.session.data['redirected']) {
                res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
            } else {
                res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
            }
        }
    }
})

router.post('/partnership-application-review/contact-details-answer', function (req, res) {
    let answer = req.session.data['contact-details-review'];

    if (!answer) {
        req.session.data['contact-details-review-invalid'] = true;
        res.redirect('/partnership-application-review/contact-details');
    } else {
        req.session.data['contact-details-confirmed'] = answer;
        req.session.data['contact-details-review-invalid'] = undefined;
        if (answer == "no") {
            res.redirect('/partnership-application-review/contact-details-query');
        } else {
            if (req.session.data['redirected']) {
                res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
            } else {
                res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
            }
        }
    }
})

router.post('/partnership-application-review/contact-preference-answer', function (req, res) {
    let answer = req.session.data['contact-preference'];

    if (!answer) {
        req.session.data['contact-preference-invalid'] = true;
        res.redirect('/partnership-application-review/contact-preference');
    } else {
        req.session.data['contact-preference-invalid'] = undefined;
        if (req.session.data['redirected']) {
            res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
        } else {
            res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
        }
    }
})

router.post('/partnership-application-review/try-submit', function (req, res) {
    let confirm = req.session.data['confirm'];

    if (confirm == 'confirm') {
        req.session.data['confirm-invalid'] = undefined;
        res.redirect('/partnership-application-review/confirmation');
    }
    else {
        req.session.data['confirm-invalid'] = true;
        res.redirect('/partnership-application-review/check-answers');
    }
})
router.post('/partnership-application-review/submit-query', function (req, res) {
    if (req.session.data['redirected']) {
        res.redirect('/redirect-done?redirect=/partnership-application-review/check-answers');
    } else {
        res.redirect('/redirect-done?redirect=/partnership-application-review/task-list');
    }
})

//---------------------------------------------------------------------------------------------------
// Generic Items
//---------------------------------------------------------------------------------------------------
router.get('/redirect', function (req, res) {
    let redirect = req.query.redirect;

    // We want to remove the confirm checkbox validation if we're doing something else
    req.session.data['confirm-invalid'] = undefined;
    req.session.data['redirected'] = true;

    res.redirect(redirect);
})

router.get('/redirect-done', function (req, res) {
    let redirect = req.query.redirect;

    req.session.data['redirected'] = undefined;

    res.redirect(redirect);
})

router.get('/set-page', function (req, res) {
    let index = parseInt(req.query.index);
    let redirect = req.query.redirect;
    let indexKey = req.query.indexKey;

    req.session.data[indexKey] = index;

    res.redirect(redirect);
})


//---------------------------------------------------------------------------------------------------
// Hack to fix MoJ menu images
//---------------------------------------------------------------------------------------------------
router.get('/assets/images/icon-arrow-white-down.svg', function (req, res) {
    res.redirect('/public/images/icon-arrow-white-down.svg');
})
router.get('/assets/images/icon-arrow-white-up.svg', function (req, res) {
    res.redirect('/public/images/icon-arrow-white-up.svg');
})
router.get('/assets/images/icon-arrow-black-down.svg', function (req, res) {
    res.redirect('/public/images/icon-arrow-black-down.svg');
})
router.get('/assets/images/icon-arrow-black-up.svg', function (req, res) {
    res.redirect('/public/images/icon-arrow-black-up.svg');
})