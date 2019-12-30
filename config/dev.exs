use Mix.Config

import System, only: [get_env: 2]

config :shorty, Links.Repo,
  username: get_env("DB_USERNAME", "postgres"),
  password: get_env("DB_PASSWORD", "postgres"),
  hostname: get_env("DB_HOST", "localhost"),
  database: "shorty_repo"

config :shorty, :children, [
  {Links.Repo, []},
  {Garbage, []},
  {Plug.Cowboy, scheme: :http, plug: Router, options: [port: 8080]}
]
