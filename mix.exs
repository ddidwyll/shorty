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
      {:ecto_sql, "~> 3.3"},
      {:postgrex, "~> 0.15.3"},
      {:plug_cowboy, "~> 2.1"},
      {:jason, "~> 1.1"},
      {:bamboo_smtp, "~> 2.1"}
    ]
  end
end
