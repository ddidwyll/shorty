import Config

config :shorty,
  ecto_repos: [Links.Repo],
  client_dir: "priv/client/public"

config :shorty, Links.Repo,
  database: "shorty_repo",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

config :shorty, Mailer,
  adapter: Bamboo.SMTPAdapter,
  server: "smtp.yandex.ru",
  port: 465,
  username: System.get_env("SMTP_USERNAME"),
  password: System.get_env("SMTP_PASSWORD"),
  tls: :if_available,
  allowed_tls_versions: [:tlsv1, :"tlsv1.1", :"tlsv1.2"],
  ssl: true,
  retries: 3
