defmodule Links.Token do
  use Ecto.Type

  import String, only: [replace: 3]

  def type, do: :string

  def autogenerate do
    import :crypto, only: [strong_rand_bytes: 1]
    import Base, only: [url_encode64: 1]

    strong_rand_bytes(7)
    |> url_encode64
    |> replace("_", "1")
    |> replace("-", "0")
    |> binary_part(0, 7)
  end

  def cast(url), do: {:ok, replace(url, ~r/[^a-zA-Z0-9_-]+/, "")}

  def dump(token), do: {:ok, token}
  def load(token), do: {:ok, token}
end
