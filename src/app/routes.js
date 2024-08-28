//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Route for Create Organisation "Do you have access to the companies house number?"
router.post('/partnership-application/create-organisation/companies-house-answer', function (req, res) {
    var hasCompaniesHouseNumber = req.session.data['have-companies-house-number']
    if (hasCompaniesHouseNumber == "yes") {
        req.session.data['organisation-name'] = "Wakefield";
        req.session.data['address-line-1'] = "10 Beech Street";
        req.session.data['address-line-2'] = "";
        req.session.data['address-town'] = "London";
        req.session.data['address-county'] = "";
        req.session.data['address-postcode'] = "EC5 6JK";
        res.redirect('/partnership-application/create-organisation/organisation-confirmation')
    } else {
        req.session.data['organisation-name'] = "";
        req.session.data['address-line-1'] = "";
        req.session.data['address-line-2'] = "";
        req.session.data['address-town'] = "";
        req.session.data['address-county'] = "";
        req.session.data['address-postcode'] = "";
        res.redirect('/partnership-application/create-organisation/organisation-name')
    }
})

// Route for Create Organisation "Is this the organisation you want to form a partnership with?"
router.post('/partnership-application/create-organisation/confirm-organisation-answer', function (req, res) {
    var isOrganisationCorrect = req.session.data['is-organisation-correct']
    if (isOrganisationCorrect == "yes-add") {
        res.redirect('/partnership-application/task-list')
    } else if (isOrganisationCorrect == "no-search") {
        res.redirect('/partnership-application/create-organisation/have-companies-house-number')
    } else {
        res.redirect('/partnership-application/create-organisation/organisation-name')
    }
})