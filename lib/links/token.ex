defmodule Links.Token do
  use Ecto.Type

  import String, only: [replace: 3]

  def autogenerate do
    import :crypto, only: [strong_rand_bytes: 1]
    import Base, only: [url_encode64: 1]

    strong_rand_bytes(7)
    |> url_encode64
    |> replace("_", "1")
    |> replace("-", "0")
    |> binary_part(0, 7)
  end

  def type, do: :string
  def cast(string), do: {:ok, string}
  def load(string), do: {:ok, string}
  def dump(string), do: {:ok, replace(string, ~r/[^a-zA-Z0-9_-]+/, "")}
end
