import GitHubCalendar from 'react-github-calendar'

interface GitHubCalendarProps {
  username: string
  className?: string
}

const GitHubCalendarComponent = ({ username, className = "" }: GitHubCalendarProps) => {
  return (
    <div className={`github-calendar-container ${className}`}>
      <GitHubCalendar
        username={username}
        colorScheme="dark"
        showWeekdayLabels={true}
        hideTotalCount={true}
      />
    </div>
  )
}

export default GitHubCalendarComponent 