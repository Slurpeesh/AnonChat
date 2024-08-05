import GitHubSvg from './svg/GitHubSvg'

export default function Footer() {
  return (
    <footer className="h-20 bg-accent-mild flex p-4">
      <a
        className="h-full hover:scale-110 transition-transform"
        href="https://github.com/Slurpeesh/AnonChat"
        target="_blank"
      >
        <GitHubSvg />
      </a>
    </footer>
  )
}
