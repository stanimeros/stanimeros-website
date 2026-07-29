import * as GitHubCalendarModule from 'react-github-calendar'

// react-github-calendar ships CJS-only; depending on how the bundler wraps
// it (Astro's client build vs. plain Vite) the default export can end up
// nested one or two levels deeper than expected. Unwrap until we hit the
// actual forwardRef component (identifiable by its $$typeof symbol).
function unwrapDefault(mod: unknown): typeof import('react-github-calendar').default {
  let current = mod as { default?: unknown; $$typeof?: unknown }
  while (current && typeof current === 'object' && !('$$typeof' in current) && 'default' in current) {
    current = current.default as typeof current
  }
  return current as typeof import('react-github-calendar').default
}

const GitHubCalendar = unwrapDefault(GitHubCalendarModule)

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