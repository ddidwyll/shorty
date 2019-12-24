import Config

config :shorty,
  ecto_repos: [Links.Repo],
  client_dir: "priv/client/public"

config :shorty, Links.Repo,
  database: "shorty_repo",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"
