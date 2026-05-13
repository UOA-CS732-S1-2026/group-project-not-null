# UniDesk Manual Testing Results

Tester: Gilda George  
Branch tested: project-testing  
Date tested:  

## Summary

| Area | Result | Notes |
|---|---|---|
| Student dashboard testing | Passed with minor warnings | Dashboard, filters, ticket list, ticket detail, navigation, and empty state worked correctly |
| Create ticket/form validation testing | Passed with minor UI issue | Required fields worked; successful submission worked; success screen heading needs improvement |
| Ticket workflow testing | Passed | New tickets appear in dashboard with Open status and automatic priority |
| Authentication/access testing | Passed | Logout worked and dashboard access was blocked after logout |
| Staff dashboard testing | Not tested yet | Staff route/login flow still needs to be confirmed |
| Console/network testing | Passed with warnings | No blocking dashboard errors, but debug logs and React key warning were found |

---

## 1. Student Dashboard Testing

| Test ID | Area | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| DB1 | Student dashboard | Dashboard loads after student login | Login as a student and open `/dashboard` | Student dashboard opens successfully | Dashboard loaded and displayed ticket summary cards and ticket list | Passed |
| DB2 | Student dashboard | Summary cards display correct ticket counts | Compare top summary cards with visible ticket list | Counts should match the tickets shown in the dashboard | Summary cards matched the visible data: 2 Open tickets, 0 In Progress, 0 Resolved, and 1 Urgent ticket. The cards appear to be display-only. | Passed |
| DB3 | Student dashboard | Status filter works | Select each option in the Status dropdown | Ticket list should update based on selected status | Status dropdown worked correctly. Each status option displayed the matching tickets accordingly. | Passed |
| DB4 | Student dashboard | Category filter works | Select each option in the Category dropdown | Ticket list should update based on selected category | Category dropdown worked correctly. Each category option displayed the matching tickets accordingly. | Passed |
| DB5 | Student dashboard | View ticket button opens ticket details | Click `View ticket` on a ticket from the student dashboard | Ticket detail page should open and show the correct ticket information | Ticket detail page opened successfully and displayed title, status, category, urgency, priority, submitted date, student request, timeline, and staff response section. No red console errors were visible. | Passed |
| DB6 | Student ticket detail | Back to My Support navigation works | Open a ticket detail page and click `Back to My Support` | User should return to the student dashboard/ticket list | Button returned the user to `/dashboard` successfully and the same tickets were still visible. However, a React console warning appeared about a `key` prop being spread into JSX. | Passed with warning |
| DB7 | Student dashboard | Create Ticket navigation works | Click `Create Ticket` from the sidebar | User should be taken to the ticket creation form | Create Ticket navigation worked successfully and opened the ticket creation form. | Passed |
| DB8 | Student dashboard | Dashboard counts update after ticket creation | Submit a new ticket and return to the dashboard | Open ticket count, shown ticket count, and urgent ticket count should update correctly | Dashboard counts updated correctly after ticket creation. Open tickets count increased, ticket list shown count increased, and urgent ticket count updated correctly based on the new ticket urgency. | Passed |
| DB9 | Student dashboard | Empty state appears when no tickets match filters | Select a filter combination with no matching tickets, such as Status = Resolved | Dashboard should show a clear no-results message instead of breaking or showing incorrect tickets | Dashboard displayed a “no tickets match” message when no tickets matched the selected filter. | Passed |
| DB10 | Student dashboard | Filter reset works | Change Status filter back to `All` after applying a no-result filter | All student tickets should appear again | All tickets appeared again after resetting the Status filter to `All`. | Passed |

---

## 2. Create Ticket / Form Validation Testing

| Test ID | Area | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| FV1 | Create Ticket form | Submit empty ticket form | Click submit without entering required fields | Form should not submit and required fields should be enforced | Form did not submit because title and description are mandatory. User remained on the ticket creation form. | Passed |
| FV2 | Create Ticket form | Category and urgency required/default values | Open Create Ticket form and check category/urgency fields | Category and urgency should have valid values before submission | Category and urgency are automatically selected by default, so the user cannot submit the form with these fields empty through the UI. | Passed |
| FV3 | Create Ticket form | Submit valid ticket | Enter valid title, description, category, and urgency, then submit | Ticket should submit successfully and show confirmation or redirect to dashboard | Ticket submitted successfully and confirmation message appeared with View Ticket and Back to My Support buttons. However, the page heading still says “Create Ticket”, which is confusing after submission. | Passed with UI issue |
| FV4 | Create Ticket form | Automatic priority assignment | Submit a valid ticket with category and urgency | System should automatically assign priority | Ticket was created successfully and displayed an automatically assigned priority in the dashboard. | Passed |

### Form Validation Note

Category and urgency missing-input validation could not be tested through the frontend because both fields are preselected by default. This is acceptable from a user perspective, but backend/API validation should still be tested separately to ensure invalid or missing category/urgency values are rejected.

---

## 3. Ticket Workflow Testing

| Test ID | Area | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TW1 | Ticket workflow | View newly submitted ticket | Submit a valid ticket, then click `View ticket` on the confirmation screen | Newly created ticket should open with the correct details | View ticket button opened the newly submitted ticket successfully. | Passed |
| TW2 | Ticket workflow | New ticket appears in student dashboard | Submit a valid ticket, click `Back to My Support`, and check dashboard | New ticket should appear in the student dashboard with Open status and assigned priority | New ticket appeared successfully in the student dashboard. Status was Open and priority was automatically assigned. | Passed |

---

## 4. Authentication and Access Testing

| Test ID | Area | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| EC1 | Auth | Logout blocks dashboard access | Logout as student, then try opening `/dashboard` directly | User should not be able to access dashboard after logout | Logout worked successfully. After logout, direct access to the dashboard was blocked. | Passed |

---

## 5. Staff Dashboard Testing

| Test ID | Area | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| ST1 | Staff dashboard | Staff dashboard loads after staff login | Login as staff and open staff dashboard | Staff dashboard should load successfully | Not tested yet. Staff route/login flow needs to be confirmed. | Not tested |
| ST2 | Staff dashboard | Staff can view all tickets | Open staff dashboard | Staff should see all submitted tickets | Not tested yet. | Not tested |
| ST3 | Staff dashboard | Staff can filter tickets by status/category | Use staff dashboard filters | Ticket list should update correctly | Not tested yet. | Not tested |
| ST4 | Staff dashboard | Staff can update ticket status | Open ticket and change status | Ticket status should update successfully | Not tested yet. | Not tested |
| ST5 | Staff/student workflow | Student sees status updated by staff | Staff updates ticket, then student checks dashboard | Student should see latest status | Not tested yet. | Not tested |

---

## 6. Console and Network Checks

| Test ID | Area | Check | Result | Status |
|---|---|---|---|---|
| CN1 | Student dashboard | Console check on dashboard load | No red console errors were visible during initial dashboard load. | Passed |
| CN2 | Ticket detail | Console check on ticket detail page | Developer debug logs appeared, including “Formatted ticket from API” and “Safe ticket prepared”. | Passed with warning |
| CN3 | Navigation/code quality | Console check after back navigation | React warning appeared about a `key` prop being spread into JSX. | Passed with warning |

---

## Overall Result for Student Side

The student dashboard and create ticket flow are mostly working. The main student user journey is functional: the user can view their dashboard, filter tickets, open ticket details, create a ticket, view the submitted ticket, return to the dashboard, and see updated ticket counts. The issues found are mostly UI polish and frontend code-quality warnings rather than blocking functional failures.