defmodule Links.Link do
  use Ecto.Schema

  alias Links.Token

  @primary_key {:id, Token, autogenerate: true}
  schema "links" do
    field(:url, :string)
    field(:owner_mail, :string)
    field(:shadow_mail, :string)
    field(:confirmed, :boolean)
    field(:confirm_token, Token, autogenerate: true)
  end
end
