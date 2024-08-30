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
    var isOrganisationCorrect = req.session.data['is-organisation-correct']
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
    var organisations = JSON.parse(fileContent);

    var index = parseInt(req.query.index);

    if (!req.session.data['legal-entites'])
        req.session.data['legal-entites'] = [];

    req.session.data['legal-entites'].push(organisations[index]);

    req.session.data['legal-entity-success-message'] = organisations[index].tradingName + " has been added as a legal entity to your application";

    res.redirect('/partnership-application/legal-entities/list');
})

// Route for removing a legal entity from the list
router.get('/partnership-application/legal-entities/remove-partnership', function (req, res) {
    var index = parseInt(req.query.index);

    var list = req.session.data['legal-entites'];
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