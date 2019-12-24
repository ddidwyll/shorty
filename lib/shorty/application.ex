defmodule Shorty.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      {Links.Repo, []},
      {Plug.Cowboy, scheme: :http, plug: Router, options: [port: 8080]}
    ]

    opts = [strategy: :one_for_one, name: Shorty.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
