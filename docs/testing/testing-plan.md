# UniDesk Testing Plan

Tester: Gilda George  
Branch tested: project-testing  
Project: UniDesk Student Support Portal  

## Purpose

This testing plan verifies whether the UniDesk prototype meets the main student and staff user requirements. Testing focuses on dashboard functionality, form validation, ticket workflow, role-based access, edge cases, and visible UI/code-quality issues.

## Testing Scope

| Area | Description |
|---|---|
| Student dashboard testing | Checks dashboard loading, ticket counts, filters, ticket list, navigation, and ticket detail view |
| Create ticket/form validation testing | Checks required fields, default dropdown values, ticket submission, and automatic priority assignment |
| Ticket workflow testing | Checks the student journey from ticket creation to viewing the submitted ticket |
| Authentication/access testing | Checks logout and protected dashboard access |
| Staff dashboard testing | To be completed after staff dashboard route and login are confirmed |
| Console/network testing | Checks red console errors, warnings, debug logs, failed API requests, and CORS issues |
| UI/UX testing | Checks confusing labels, repeated information, unclear buttons, and user-facing design issues |

## Status Labels

| Status | Meaning |
|---|---|
| Passed | Feature worked as expected |
| Failed | Feature did not work as expected |
| Blocked | Test could not be completed due to missing route, missing feature, CORS issue, or setup issue |
| Passed with warning | Main feature worked, but a minor issue, warning, or UI concern was found |
| Passed with UI issue | Functionality worked, but user experience should be improved |

## Evidence to Collect

| Evidence Type | Examples |
|---|---|
| Screenshots | Dashboard loaded, ticket detail page, create ticket success page, empty state, console warning |
| Console checks | Red errors, warnings, debug logs |
| Network checks | API status codes, failed requests, CORS errors |
| Manual test results | Clear table of expected vs actual results |
| Bug report | Bug ID, area, issue, impact, and suggested fix |

## Testing Notes

- Student dashboard testing has been completed for the current branch.
- Staff dashboard testing still needs to be completed once the correct staff route and login flow are confirmed.
- Category and urgency missing-input validation could not be tested through the frontend because both fields are preselected by default. This is acceptable from a user perspective, but backend/API validation should still be tested separately.