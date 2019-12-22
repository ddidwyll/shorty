import Config

config :shorty,
  ecto_repos: [Links.Repo]

config :shorty, Links.Repo,
  database: "shorty_repo",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"
