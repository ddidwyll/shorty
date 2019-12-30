defmodule Links.Link do
  use Ecto.Schema

  alias Links.Token
  alias Links.Link
  alias Ecto.Schema.Metadata

  @type t :: %Link{
          __meta__: Metadata.t(),
          id: Token.t(),
          url: binary,
          owner_mail: binary | nil,
          shadow_mail: binary | nil,
          confirmed: boolean,
          confirm_token: Token.t()
        }

  @primary_key {:id, Token, autogenerate: true}
  schema "links" do
    field(:url, :string)
    field(:owner_mail, :string)
    field(:shadow_mail, :string)
    field(:confirmed, :boolean)
    field(:confirm_token, Token, autogenerate: true)
  end
end
