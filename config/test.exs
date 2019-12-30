use Mix.Config

import System, only: [get_env: 2]

config :shorty, Links.Repo,
  username: get_env("DB_USERNAME", "postgres"),
  password: get_env("DB_PASSWORD", "postgres"),
  hostname: get_env("DB_HOST", "localhost"),
  database: "shorty_repo_test",
  pool: Ecto.Adapters.SQL.Sandbox

config :shorty, :children, [
  {Links.Repo, []}
]

config :logger, level: :warn
