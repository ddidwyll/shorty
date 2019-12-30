defmodule Shorty.Application do
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = Application.get_env(:shorty, :children)
    opts = [strategy: :one_for_one, name: Shorty.Supervisor]

    Supervisor.start_link(children, opts)
  end
end
