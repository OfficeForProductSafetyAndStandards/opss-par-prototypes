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
router.post('/partnership-application/create-organisation/companies-house-answer', function (req, res) {
    let hasCompaniesHouseNumber = req.session.data['have-companies-house-number']
    req.session.data['companies-house-number-error'] = false;

    if (hasCompaniesHouseNumber == "yes") {
        const fileContent = fs.readFileSync("./app/data/organisations.json", 'utf8');
        let organisations = JSON.parse(fileContent);
        const companiesHouseNumber = req.session.data['companies-house-number'];
        const organisation = organisations.find(org => org.companiesHouseNumber === companiesHouseNumber);

        if (organisation) {
            req.session.data['organisation-name'] = organisation.tradingName;
            req.session.data['address-line-1'] = organisation.address.line1;
            req.session.data['address-line-2'] = organisation.address.line2;
            req.session.data['address-town'] = organisation.address.town;
            req.session.data['address-county'] = organisation.address.county;
            req.session.data['address-postcode'] = organisation.address.postcode;
            res.redirect('/partnership-application/create-organisation/organisation-confirmation');
        } else {
            req.session.data['companies-house-number-error'] = true;
            res.redirect('/partnership-application/create-organisation/have-companies-house-number');
        }
    } else {
        req.session.data['organisation-name'] = "";
        req.session.data['address-line-1'] = "";
        req.session.data['address-line-2'] = "";
        req.session.data['address-town'] = "";
        req.session.data['address-county'] = "";
        req.session.data['address-postcode'] = "";
        res.redirect('/partnership-application/create-organisation/organisation-name');
    }
})

// Route for Create Organisation "Is this the organisation you want to form a partnership with?"
router.post('/partnership-application/create-organisation/confirm-organisation-answer', function (req, res) {
    var isOrganisationCorrect = req.session.data['is-organisation-correct']
    if (isOrganisationCorrect == "yes-add") {
        res.redirect('/partnership-application/task-list');
    } else if (isOrganisationCorrect == "no-search") {
        res.redirect('/partnership-application/create-organisation/have-companies-house-number');
    } else {
        res.redirect('/partnership-application/create-organisation/organisation-name');
    }
})

// Route for Select the organisation for your partnership
// If the user clicks to select an organisation
// we load the orgnisations file and load the correct index'd item
router.get('/partnership-application/select-partnership-answer', function (req, res) {
    const fileContent = fs.readFileSync("./app/data/organisations.json", 'utf8');
    var organisations = JSON.parse(fileContent);

    var index = parseInt(req.query.index);

    req.session.data['companies-house-number'] = organisations[index].companiesHouseNumber;
    req.session.data['aorganisation-name'] = organisations[index].tradingName;
    req.session.data['address-line-1'] = organisations[index].address.line1;
    req.session.data['address-line-2'] = organisations[index].address.line2;
    req.session.data['address-town'] = organisations[index].address.town;
    req.session.data['address-county'] = organisations[index].address.county;
    req.session.data['address-postcode'] = organisations[index].address.postcode;

    res.redirect('/partnership-application/task-list');
})