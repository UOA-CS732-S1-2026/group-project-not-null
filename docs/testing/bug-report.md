# UniDesk Bug and Blocker Report

Tester: Gilda George  
Branch tested: project-testing  
Date tested:  

| Bug ID | Area | Issue | Steps to Reproduce | Impact | Suggested Fix | Status |
|---|---|---|---|---|---|---|
| B1 | Student dashboard UI | Yellow icons on summary cards look clickable even though they are display-only | Open student dashboard and observe the top summary cards | Users may mistakenly think the icons/cards are interactive filters or buttons | Either make the summary cards clickable filters or reduce the button-like styling of the yellow icons so users understand they are only visual indicators. | Open |
| B2 | Ticket detail UI | Ticket detail page shows repeated dates and an unclear “Updated” label | Open a ticket detail page from the student dashboard | Users may be confused because the updated date appears even though students cannot edit the ticket, and similar dates appear in multiple sections | Keep one clear submitted date near the ticket details, and only show “Last updated” if the ticket status or staff response has actually changed. Avoid repeating the same date inside multiple sections. | Open |
| B3 | Code/UI polish | Developer debug logs appear in browser console | Open a ticket detail page and inspect the Console tab | App still works, but console logs should be removed before final submission for a cleaner prototype | Remove unnecessary `console.log()` statements such as “Formatted ticket from API” and “Safe ticket prepared”. | Open |
| B4 | Ticket detail UI | Timeline looks like radio buttons instead of a progress timeline | Open a ticket detail page and view the Timeline section | Users may not clearly understand this as a ticket progress timeline because the circular markers look like selectable radio buttons | Redesign the timeline using a vertical progress line with connected steps, or use clearer icons/checkmarks to show completed, current, and pending ticket statuses. | Open |
| B5 | Frontend code quality | React warning about `key` prop being spread into JSX | Open ticket detail page, click `Back to My Support`, then check Console | App still works, but React warns that a `key` prop is being spread into JSX, which should be fixed for cleaner code quality | Pass `key` directly to the component instead of including it inside a spread props object. For example, use `<DashboardCard key={someKey} {...props} />` instead of `<DashboardCard {...propsWithKey} />`. | Open |
| B6 | Create Ticket UI | Page heading remains “Create Ticket” after successful submission | Submit a valid ticket from the Create Ticket form | User may be confused because the page shows a success message but the heading still suggests they are creating a ticket | Change the heading after successful submission from “Create Ticket” to “Ticket Submitted” or “Submission Successful”. | Open |
| B8 | Staff dashboard code quality | React key warnings appear during automated staff dashboard testing | Run `npm run test:run` and check StaffDashboard test output | Tests still pass, but warnings indicate list items/components need proper React keys | Pass `key` directly instead of spreading it in props, and ensure mapped list items in StaffAnalyticsSection have unique keys | Open |

## Notes

- B1, B2, B4, and B6 are UI/UX issues. They do not stop the main student workflow, but they should be improved to make the prototype clearer from a user's perspective.
- B3 and B5 are code-quality/polish issues. They do not break the app, but fixing them would make the final implementation look cleaner and more professional.
- No blocking issue was found in the tested student dashboard workflow.