defmodule Links.TokenTest do
  use ExUnit.Case

  import Links.Token

  @non_alphanumeric "dak&^$39*DS 3ksd:_-+="
  @sanitized_token "dak39DS3ksd_-"

  test "autogenerate" do
    token = autogenerate()

    assert 7 = String.length(token)
    assert true = Regex.match?(~r/[a-zA-Z0-9]+/, token)
  end

  test "dump" do
    assert {:ok, @sanitized_token} = dump(@non_alphanumeric)
  end
end
