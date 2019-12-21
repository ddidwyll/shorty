defmodule Shorty.MixProject do
  use Mix.Project

  def project do
    [
      app: :shorty,
      version: "0.1.0",
      elixir: "~> 1.9",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {Shorty.Application, []}
    ]
  end

  defp deps do
    [
      {:ecto_sql, "~> 3.0"},
      {:postgrex, "~> 0.15.3"}
    ]
  end
end
