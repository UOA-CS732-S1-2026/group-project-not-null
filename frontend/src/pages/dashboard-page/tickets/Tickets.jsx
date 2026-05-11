import { Header } from '../../components/layout/Header.jsx'
import { Main } from '../../components/layout/Main.jsx'
import { TopNav } from '../../components/layout/TopNav.jsx'

const tickets = [
  ['#1248', 'Cannot access student portal', 'IT & Technical', 'Open'],
  ['#1247', 'Course change request', 'Enrolment & Admin', 'Pending'],
  ['#1246', 'Exam timetable clash', 'Academic Support', 'Open'],
  ['#1245', 'Scholarship payment date', 'Accommodation & Finance', 'Resolved'],
]

export default function Tickets() {
  return (
    <>
      <Header eyebrow="Workspace" title="Tickets" />
      <Main>
        <TopNav
          links={[
            { title: 'All', href: '/tickets' },
            { title: 'Students', href: '/students' },
            { title: 'Knowledge', href: '/knowledge-base' },
          ]}
        />
        <section className="panel">
          <div className="panel-header">
            <h2>Active Requests</h2>
            <span>12 open</span>
          </div>
          <div className="data-table" role="table" aria-label="Tickets">
            {tickets.map(([id, subject, category, status]) => (
              <div className="data-row" role="row" key={id}>
                <strong>{id}</strong>
                <span>{subject}</span>
                <small>{category}</small>
                <em>{status}</em>
              </div>
            ))}
          </div>
        </section>
      </Main>
    </>
  )
}
