use Mix.Config

import System, only: [get_env: 2]

config :shorty,
  ecto_repos: [Links.Repo],
  client_dir: "priv/client/public",
  request_expires_sec: 3600,
  validator_mod: Links.Validator,
  mailer_mod: Mailer.Confirm,
  links_mod: Links

config :shorty, Mailer,
  adapter: Bamboo.SMTPAdapter,
  server: "smtp.yandex.ru",
  port: 465,
  username: get_env("SMTP_USERNAME", nil),
  password: get_env("SMTP_PASSWORD", nil),
  tls: :if_available,
  allowed_tls_versions: [:tlsv1, :"tlsv1.1", :"tlsv1.2"],
  ssl: true,
  retries: 3

import_config "#{Mix.env()}.exs"
